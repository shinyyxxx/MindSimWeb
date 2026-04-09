import React, { memo, useState, useRef, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Mind } from '../mindwebsite/classes/Mind'
import Mental from '../mindwebsite/classes/Mental'
import FeelingMental from '../mindwebsite/classes/neutral/FeelingMental'
import { CodeParser, stripDslExplainLines, type ParsedAction } from '../utils/codeParser'
import { playTextToSpeech } from '../utils/googleTts'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8004'
const BASIS_PATH = 'https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/'

interface ExecuteResult {
  message: string
  created_minds: Array<{ id: number; name: string; color: string; position: number[]; scale: number; mental_sphere_ids: number[] }>
  created_mentals: Array<{ id: number; name: string; color: string; position: number[]; scale: number }>
  execution_log: string[]
  summary: { minds_created: number; mentals_created: number }
}

const PLACEHOLDER_CODE = `m = Mind()
m.name = "Mind"
m.color = "#3b82f6"
m.scale = 1.6

mt1 = ContactMental()
mt1.name = "Contact"
mt1.color = "#a1a1aa"
mt1.scale = 0.140
mt1.position = (0.000, -0.450, 0.100)
m.add(mt1)

mt2 = FeelingMental()
mt2.name = "Feeling"
mt2.color = "#a1a1aa"
mt2.scale = 0.140
mt2.position = (0.150, -0.400, 0.000)
m.add(mt2)

mt3 = PerceptionMental()
mt3.name = "Perception"
mt3.color = "#60a5fa"
mt3.scale = 0.180
mt3.position = (-0.140, 0.080, 0.180)
m.add(mt3)

mt4 = IntentionMental()
mt4.name = "Intention"
mt4.color = "#a1a1aa"
mt4.scale = 0.140
mt4.position = (0.050, -0.520, 0.050)
m.add(mt4)

mt5 = AttentionMental()
mt5.name = "Attention"
mt5.color = "#a1a1aa"
mt5.scale = 0.140
mt5.position = (-0.100, -0.500, -0.150)
m.add(mt5)

mt6 = ConcentrationMental()
mt6.name = "Concentration"
mt6.color = "#a1a1aa"
mt6.scale = 0.140
mt6.position = (-0.180, -0.420, 0.020)
m.add(mt6)

mt7 = LifeFacultyMental()
mt7.name = "Life Faculty"
mt7.color = "#a1a1aa"
mt7.scale = 0.140
mt7.position = (0.180, -0.480, -0.080)
m.add(mt7)`

function parseNumberList(value: string): [number, number, number] | null {
  const match = value.match(/[\[(]([^\])]*)[\])]/)
  if (!match) return null
  const parts = match[1].split(',').map((v) => parseFloat(v.trim()))
  if (parts.length !== 3 || parts.some((v) => isNaN(v))) return null
  return [parts[0], parts[1], parts[2]]
}

function convertDslToPython(dsl: string): string {
  return dsl
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return line
      const ctorMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\(\)$/)
      if (ctorMatch) {
        const className = ctorMatch[2]
        if (className !== 'Mind' && (className === 'Mental' || className.endsWith('Mental'))) {
          return `${ctorMatch[1]} = Mental()`
        }
      }
      return line.replace(/\.add\(/, '.append(')
    })
    .join('\n')
}

function MindSphere({ mind }: { mind: Mind }) {
  useFrame((_state, delta) => {
    mind.updatePhysics(delta)
  })
  const mesh = mind.getMesh()
  if (!mesh) return null
  return <primitive object={mesh} />
}

function MindMentalModels({ mind }: { mind: Mind }) {
  const { gl } = useThree()

  useEffect(() => {
    const mentals = mind.getMentals()
    mentals.forEach((mental) => {
      mental.loadModel(gl, { basisPath: BASIS_PATH }).catch((err) => {
        console.error('Failed to load mental model', err)
      })
    })

    return () => {
      mentals.forEach((mental) => {
        mental.detachModel()
      })
    }
  }, [gl, mind])

  return null
}

const ScenePlayground = memo(function ScenePlayground({ mind }: { mind: Mind }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 60 }}
      shadows
      gl={{ antialias: true, toneMappingExposure: 1.2 }}
    >
      <Environment preset="dawn" background blur={1} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enableZoom
        enablePan
        minDistance={1}
        maxDistance={10}
      />
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 8, 5]} intensity={2.0} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={1.5} />
      <pointLight position={[0, 6, 0]} intensity={2.0} distance={15} decay={2} />
      <MindSphere mind={mind} />
      <MindMentalModels mind={mind} />
    </Canvas>
  )
})

type LocalResult = {
  log: string[]
  mindCount: number
  mentalCount: number
}

type RuntimeContext = {
  mindsByVar: Map<string, Mind>
  mentalsByVar: Map<string, Mental>
}

export function CodeRunner(): React.ReactElement {
  const [code, setCode] = useState(PLACEHOLDER_CODE)
  const [miniCode, setMiniCode] = useState('mt2.explain()')
  const [result, setResult] = useState<ExecuteResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [miniLoading, setMiniLoading] = useState(false)
  const [miniStatus, setMiniStatus] = useState<string | null>(null)
  const [miniError, setMiniError] = useState<string | null>(null)
  const [localResult, setLocalResult] = useState<LocalResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [sceneMind, setSceneMind] = useState<Mind | null>(null)
  const prevMindRef = useRef<Mind | null>(null)
  const runtimeContextRef = useRef<RuntimeContext>({
    mindsByVar: new Map<string, Mind>(),
    mentalsByVar: new Map<string, Mental>(),
  })
  const [miniEditorOpen, setMiniEditorOpen] = useState(false)
  const [miniEditorPos, setMiniEditorPos] = useState({ x: 28, y: 96 })
  const miniEditorDragRef = useRef({ active: false, dx: 0, dy: 0 })

  useEffect(() => {
    return () => {
      prevMindRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!miniEditorDragRef.current.active) return
      const maxX = Math.max(12, window.innerWidth - 392)
      const maxY = Math.max(12, window.innerHeight - 260)
      const nextX = Math.min(maxX, Math.max(12, e.clientX - miniEditorDragRef.current.dx))
      const nextY = Math.min(maxY, Math.max(12, e.clientY - miniEditorDragRef.current.dy))
      setMiniEditorPos({ x: nextX, y: nextY })
    }
    const onMouseUp = () => {
      if (!miniEditorDragRef.current.active) return
      miniEditorDragRef.current.active = false
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const [playgroundHeight, setPlaygroundHeight] = useState(400)
  const isDraggingRef = useRef(false)
  const dragStartYRef = useRef(0)
  const dragStartHeightRef = useRef(0)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const delta = e.clientY - dragStartYRef.current
      setPlaygroundHeight(Math.max(200, Math.min(800, dragStartHeightRef.current + delta)))
    }
    const onMouseUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    dragStartYRef.current = e.clientY
    dragStartHeightRef.current = playgroundHeight
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'row-resize'
  }, [playgroundHeight])

  const handleMiniEditorPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null
    if (!target?.closest('[data-cr-mini-drag-handle]')) return
    miniEditorDragRef.current.active = true
    miniEditorDragRef.current.dx = e.clientX - miniEditorPos.x
    miniEditorDragRef.current.dy = e.clientY - miniEditorPos.y
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }, [miniEditorPos.x, miniEditorPos.y])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') setCode(text)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const parseStringLiteralOrRaw = useCallback((input: string): string => {
    const value = input.trim()
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith('\'') && value.endsWith('\'') && value.length >= 2)
    ) {
      return value.slice(1, -1)
    }
    return value
  }, [])

  const handleExecute = useCallback(async () => {
    if (!code.trim()) return

    setParseError(null)
    setError(null)
    setMiniError(null)
    setMiniStatus(null)
    setResult(null)
    setLocalResult(null)

    const parser = new CodeParser()
    let actions: ParsedAction[]
    try {
      actions = parser.parse(code)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Parse error')
      return
    }

    if (prevMindRef.current) {
      prevMindRef.current.dispose()
      prevMindRef.current = null
    }

    const log: string[] = []
    const mindsByVar = new Map<string, Mind>()
    const mentalsByVar = new Map<string, Mental>()
    const linkedMentalVars = new Set<string>()
    let mindCount = 0
    let mentalCount = 0

    actions.forEach((a) => {
      if (a.type === 'add_mental_to_mind') linkedMentalVars.add(a.mentalVariable)
    })

    for (const action of actions) {
      if (action.type === 'variable_explain') {
        const mind = mindsByVar.get(action.variable)
        const mental = mentalsByVar.get(action.variable)
        if (!mind && !mental) {
          log.push(`Explain skipped: unknown variable '${action.variable}'`)
          continue
        }
        const label = mind ? mind.getName() : mental!.getName()
        const explicit = action.text
        if (explicit !== null) {
          if (mind) mind.setDetail(explicit)
          else mental!.setDetail(explicit)
        }
        const detailTrim = (mind ? mind.getDetail() : mental!.getDetail() || '').trim()
        const speak =
          explicit !== null
            ? `${label}. ${explicit}`
            : detailTrim.length > 0
              ? `${label}. ${detailTrim}`
              : label
        log.push(`TTS (${action.variable}): ${speak}`)
        try {
          await playTextToSpeech(speak)
        } catch (err) {
          log.push(`TTS error: ${err instanceof Error ? err.message : String(err)}`)
        }
        continue
      }
      if (action.type === 'create_mind') {
        const mind = new Mind({
          name: action.data.name,
          color: action.data.color,
          scale: action.data.scale,
          position: action.data.position,
          transparent: true,
          opacity: 0.15,
          labelEnabled: true,
          labelWorldSize: 0.6,
          labelOffset: 0.25,
        })
        mindsByVar.set(action.variable, mind)
        mindCount++
        log.push(`Created Mind '${action.data.name}' (var: ${action.variable})`)
      } else if (action.type === 'create_mental') {
        const MentalCtor = action.data.constructorName === 'FeelingMental' ? FeelingMental : Mental
        const mental = new MentalCtor({
          name: action.data.name,
          detail: '',
          color: action.data.color,
          scale: action.data.scale,
          position: action.data.position,
          labelEnabled: false,
          motionSpeed: 0.0012,
          opacity: 0.55,
        })
        mentalsByVar.set(action.variable, mental)
        mentalCount++
        log.push(`Created Mental '${action.data.name}' (var: ${action.variable})`)
      } else if (action.type === 'mental_feel') {
        const mental = mentalsByVar.get(action.variable)
        if (!mental) continue
        if (mental instanceof FeelingMental) {
          mental.feel(action.mood)
          log.push(`Feeling mood model applied '${action.mood}' on '${mental.getName()}'`)
        } else {
          log.push(`feel() skipped for '${action.variable}': not a FeelingMental`)
        }
      } else if (action.type === 'mental_active') {
        const mental = mentalsByVar.get(action.variable)
        if (!mental) continue
        mental.active()
        log.push(`Active pulse applied on '${mental.getName()}'`)
      } else if (action.type === 'update_mind_attribute') {
        const mind = mindsByVar.get(action.variable)
        if (!mind) continue
        if (action.attribute === 'name') mind.setName(action.value)
        else if (action.attribute === 'color') mind.setColor(action.value)
        else if (action.attribute === 'scale') {
          const s = parseFloat(action.value)
          if (!isNaN(s)) mind.setScale(s)
        } else if (action.attribute === 'position') {
          const vec = parseNumberList(action.value)
          if (vec) mind.setPosition(vec)
        } else if (action.attribute === 'detail') {
          mind.setDetail(action.value)
        }
      } else if (action.type === 'update_mental_attribute') {
        const mental = mentalsByVar.get(action.variable)
        if (!mental) continue
        if (action.attribute === 'name') mental.setName(action.value)
        else if (action.attribute === 'color') mental.setColor(action.value)
        else if (action.attribute === 'scale') {
          const s = parseFloat(action.value)
          if (!isNaN(s)) mental.setScale(s)
        } else if (action.attribute === 'position') {
          const vec = parseNumberList(action.value)
          if (vec) mental.setPosition(vec)
        } else if (action.attribute === 'detail') {
          mental.setDetail(action.value)
        }
      } else if (action.type === 'add_mental_to_mind') {
        const mind = mindsByVar.get(action.mindVariable)
        const mental = mentalsByVar.get(action.mentalVariable)
        if (mind && mental) {
          mind.addMental(mental)
          log.push(`Added '${mental.getName()}' to '${mind.getName()}'`)
        }
      }
    }

    const firstMind = mindsByVar.values().next().value as Mind | undefined
    if (firstMind) {
      prevMindRef.current = firstMind
      setSceneMind(firstMind)
    } else {
      setSceneMind(null)
    }
    runtimeContextRef.current = {
      mindsByVar: new Map(mindsByVar),
      mentalsByVar: new Map(mentalsByVar),
    }

    setLocalResult({ log, mindCount, mentalCount })

    setLoading(true)
    try {
      const pythonCode = convertDslToPython(stripDslExplainLines(code))
      const res = await fetch(`${API_BASE}/api/execute_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pythonCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || `Error ${res.status}`)
        return
      }
      setResult(data as ExecuteResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [code])

  const handleRunMini = useCallback(async () => {
    const commandText = miniCode.trim()
    if (!commandText) return

    const { mindsByVar, mentalsByVar } = runtimeContextRef.current
    const knownVarCount = mindsByVar.size + mentalsByVar.size
    if (knownVarCount === 0) {
      setMiniError('Run the normal editor once first so variables exist (example: mt2).')
      setMiniStatus(null)
      return
    }

    setMiniLoading(true)
    setMiniError(null)
    const logs: string[] = []
    try {
      const lines = commandText.split('\n')
      for (let i = 0; i < lines.length; i += 1) {
        const lineNo = i + 1
        const trimmed = lines[i].trim()
        if (!trimmed || trimmed.startsWith('#')) continue

        const explainCallMatch = trimmed.match(/^(\w+)\.explain\s*\(\s*\)\s*;?\s*$/)
        if (explainCallMatch) {
          const variable = explainCallMatch[1]
          const mind = mindsByVar.get(variable)
          const mental = mentalsByVar.get(variable)
          if (!mind && !mental) throw new Error(`Line ${lineNo}: variable "${variable}" not found`)
          const targetName = mind ? mind.getName() : mental!.getName()
          const detailTrim = (mind ? mind.getDetail() : mental!.getDetail() || '').trim()
          const speak = detailTrim.length > 0 ? `${targetName}. ${detailTrim}` : targetName
          logs.push(`TTS (${variable}): ${speak}`)
          await playTextToSpeech(speak)
          continue
        }

        const explainAssignMatch = trimmed.match(/^(\w+)\.explain\s*=\s*(.+)\s*$/)
        if (explainAssignMatch) {
          const variable = explainAssignMatch[1]
          const text = parseStringLiteralOrRaw(explainAssignMatch[2])
          const mind = mindsByVar.get(variable)
          const mental = mentalsByVar.get(variable)
          if (!mind && !mental) throw new Error(`Line ${lineNo}: variable "${variable}" not found`)
          if (mind) mind.setDetail(text)
          else mental!.setDetail(text)
          const label = mind ? mind.getName() : mental!.getName()
          const speak = `${label}. ${text}`
          logs.push(`TTS (${variable}): ${speak}`)
          await playTextToSpeech(speak)
          continue
        }

        const feelMatch = trimmed.match(/^(\w+)\.feel\s*\(\s*(['"])(.*)\2\s*\)\s*;?\s*$/)
        if (feelMatch) {
          const variable = feelMatch[1]
          const mood = feelMatch[3].trim()
          const mental = mentalsByVar.get(variable)
          if (!mental) throw new Error(`Line ${lineNo}: variable "${variable}" not found`)
          if (!(mental instanceof FeelingMental)) {
            throw new Error(`Line ${lineNo}: feel() is only supported on FeelingMental`)
          }
          mental.feel(mood)
          logs.push(`Feeling mood model applied '${mood}' on '${mental.getName()}'`)
          continue
        }

        const activeMatch = trimmed.match(/^(\w+)\.active\s*\(\s*\)\s*;?\s*$/)
        if (activeMatch) {
          const variable = activeMatch[1]
          const mental = mentalsByVar.get(variable)
          if (!mental) throw new Error(`Line ${lineNo}: variable "${variable}" not found`)
          mental.active()
          logs.push(`Active pulse applied on '${mental.getName()}'`)
          continue
        }

        const updateMatch = trimmed.match(/^(\w+)\.(\w+)\s*=\s*(.+)\s*$/)
        if (updateMatch) {
          const variable = updateMatch[1]
          const attribute = updateMatch[2]
          const rawValue = parseStringLiteralOrRaw(updateMatch[3])
          const mind = mindsByVar.get(variable)
          const mental = mentalsByVar.get(variable)
          if (!mind && !mental) throw new Error(`Line ${lineNo}: variable "${variable}" not found`)

          if (mind) {
            if (attribute === 'name') mind.setName(rawValue)
            else if (attribute === 'color') mind.setColor(rawValue)
            else if (attribute === 'scale') {
              const s = parseFloat(rawValue)
              if (!Number.isNaN(s)) mind.setScale(s)
            } else if (attribute === 'position') {
              const vec = parseNumberList(rawValue)
              if (vec) mind.setPosition(vec)
            } else if (attribute === 'detail') {
              mind.setDetail(rawValue)
            } else {
              throw new Error(`Line ${lineNo}: unsupported attribute "${attribute}" for Mind`)
            }
            logs.push(`Updated ${variable}.${attribute}`)
            continue
          }

          if (mental) {
            if (attribute === 'name') mental.setName(rawValue)
            else if (attribute === 'color') mental.setColor(rawValue)
            else if (attribute === 'scale') {
              const s = parseFloat(rawValue)
              if (!Number.isNaN(s)) mental.setScale(s)
            } else if (attribute === 'position') {
              const vec = parseNumberList(rawValue)
              if (vec) mental.setPosition(vec)
            } else if (attribute === 'detail') {
              mental.setDetail(rawValue)
            } else {
              throw new Error(`Line ${lineNo}: unsupported attribute "${attribute}" for Mental`)
            }
            logs.push(`Updated ${variable}.${attribute}`)
            continue
          }
        }

        throw new Error(`Line ${lineNo}: unsupported mini command`)
      }

      const knownVariables = [
        ...Array.from(mindsByVar.keys()),
        ...Array.from(mentalsByVar.keys()),
      ]
      setMiniStatus(
        logs.length > 0
          ? `${logs.length} command(s) applied. Known vars: ${knownVariables.join(', ')}`
          : 'No commands executed.',
      )
      setLocalResult((prev) => {
        const mindCount = mindsByVar.size
        const mentalCount = mentalsByVar.size
        if (!prev) return { log: logs, mindCount, mentalCount }
        return { ...prev, mindCount, mentalCount, log: [...prev.log, ...logs] }
      })
    } catch (err) {
      setMiniError(err instanceof Error ? err.message : 'Mini IDE command failed')
      setMiniStatus(null)
    } finally {
      setMiniLoading(false)
    }
  }, [miniCode, parseStringLiteralOrRaw])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleExecute()
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const val = ta.value
      setCode(val.substring(0, start) + '    ' + val.substring(end))
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4
      })
    }
  }, [handleExecute])

  const handleMiniKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRunMini()
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const val = ta.value
      setMiniCode(val.substring(0, start) + '    ' + val.substring(end))
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4
      })
    }
  }, [handleRunMini])

  return (
    <main className="page cr-code-runner-page">
      <div className="cr-layout">
        <section className="cr-editor-panel">
          <div className="cr-editor-header">
            <div>
              <h1 className="cr-title">Code Runner</h1>
              <p className="cr-subtitle">
                Write or upload code using <code>Mind()</code> and <code>*Mental()</code> with <code>.add()</code> to create objects.
                Use <code>variable.explain = &quot;…&quot;</code> (set detail + TTS) or <code>variable.explain()</code> (TTS: detail, or name if empty).
              </p>
            </div>
            <div className="cr-actions">
              <input ref={fileInputRef} type="file" accept=".py,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
              <button className="cr-btn cr-btn-secondary" onClick={() => fileInputRef.current?.click()}>
                Upload .py
              </button>
              <button
                className="cr-btn cr-btn-secondary"
                onClick={() => {
                  setMiniEditorOpen((prev) => !prev)
                  setMiniError(null)
                }}
              >
                {miniEditorOpen ? 'Hide Mini IDE' : 'Mini IDE'}
              </button>
              <button className="cr-btn cr-btn-primary" onClick={handleExecute} disabled={loading || !code.trim()}>
                {loading ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>

          <div className="cr-editor-wrap">
            <div className="cr-line-numbers">
              {code.split('\n').map((_, i) => (<span key={i}>{i + 1}</span>))}
            </div>
            <textarea
              className="cr-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder={'m = Mind()\nm.name = "my mind"\n\nmt = ContactMental()\nm.add(mt)'}
            />
          </div>

          <div className="cr-hint">
            <kbd>Cmd</kbd>+<kbd>Enter</kbd> to run &middot; <kbd>Tab</kbd> to indent
          </div>
        </section>

        <section className="cr-result-panel">
          {!localResult && !result && !error && !parseError && !loading && (
            <div className="cr-empty">
              <div className="cr-empty-icon">&#9654;</div>
              <p>Run your code to see results here</p>
            </div>
          )}

          {parseError && (
            <div className="cr-error-box">
              <strong>Parse Error</strong>
              <p>{parseError}</p>
            </div>
          )}

          {error && (
            <div className="cr-error-box">
              <strong>Backend Error</strong>
              <p>{error}</p>
            </div>
          )}

          {localResult && (
            <div className="cr-result-stack">
              <div className="cr-summary">
                <span className="cr-summary-msg">
                  Parsed {localResult.mindCount} mind(s) and {localResult.mentalCount} mental(s)
                  {loading ? ' — persisting...' : result ? ' — persisted' : ''}
                </span>
                <div className="cr-summary-badges">
                  <span className="cr-badge cr-badge-mind">
                    {localResult.mindCount} Mind{localResult.mindCount !== 1 && 's'}
                  </span>
                  <span className="cr-badge cr-badge-mental">
                    {localResult.mentalCount} Mental{localResult.mentalCount !== 1 && 's'}
                  </span>
                </div>
              </div>

              {sceneMind && (
                <div className="cr-section cr-playground-embed-section">
                  <div className="cr-playground-header cr-playground-header--inline">
                    <h3 className="cr-section-title" style={{ margin: 0 }}>
                      3D Playground
                    </h3>
                    <span className="cr-playground-hint">Orbit · zoom · fills column height</span>
                  </div>
                  <div className="cr-playground-canvas cr-playground-canvas--embed">
                    <ScenePlayground mind={sceneMind} />
                  </div>
                </div>
              )}

              {localResult.log.length > 0 && (
                <div className="cr-section cr-section--shrink">
                  <h3 className="cr-section-title">Execution Log</h3>
                  <div className="cr-log">
                    {localResult.log.map((entry, i) => (
                      <div key={i} className="cr-log-entry">
                        <span className="cr-log-idx">{i + 1}</span>
                        {entry}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {miniEditorOpen && (
        <div className="cr-mini-ide" onPointerDown={handleMiniEditorPointerDown} style={{ left: miniEditorPos.x, top: miniEditorPos.y }}>
          <div className="cr-mini-ide-header" data-cr-mini-drag-handle>
            <strong className="cr-mini-ide-title">Mini IDE</strong>
            <div className="cr-mini-ide-header-actions">
              <button className="cr-mini-ide-btn cr-mini-ide-btn-run" onClick={handleRunMini} disabled={miniLoading || !miniCode.trim()}>
                {miniLoading ? 'Running...' : 'Run'}
              </button>
              <button className="cr-mini-ide-btn" onClick={() => setMiniEditorOpen(false)}>
                Close
              </button>
            </div>
          </div>
          <textarea
            className="cr-mini-ide-textarea"
            value={miniCode}
            onChange={(e) => setMiniCode(e.target.value)}
            onKeyDown={handleMiniKeyDown}
            spellCheck={false}
          />
          <div className="cr-mini-ide-hint">
            Uses vars from normal Run (examples: <code>mt2.explain()</code>, <code>mt2.active()</code>) · <kbd>Cmd/Ctrl</kbd>+<kbd>Enter</kbd> to run
          </div>
          {miniError && <div className="cr-mini-ide-error">{miniError}</div>}
          {miniStatus && !miniError && <div className="cr-mini-ide-status">{miniStatus}</div>}
        </div>
      )}

      {result && result.execution_log.length > 0 && (
        <>
          <div className="cr-resize-handle" onMouseDown={handleResizeStart}>
            <div className="cr-resize-grip" />
          </div>
          <section className="cr-playground-panel cr-backend-log-panel" style={{ height: playgroundHeight }}>
            <div className="cr-playground-header">
              <h3 className="cr-section-title" style={{ margin: 0 }}>
                Backend Log
              </h3>
              <span className="cr-playground-hint">Drag the handle above to resize</span>
            </div>
            <div className="cr-backend-log-body">
              <div className="cr-log cr-log--fill">
                {result.execution_log.map((entry, i) => (
                  <div key={i} className="cr-log-entry">
                    <span className="cr-log-idx">{i + 1}</span>
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  )
}
