import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Mind } from '../mindwebsite/classes/Mind'
import Mental from '../mindwebsite/classes/Mental'
import { CodeParser, type ParsedAction } from '../utils/codeParser'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8004'

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

type LocalResult = {
  log: string[]
  mindCount: number
  mentalCount: number
}

export function CodeRunner(): React.ReactElement {
  const [code, setCode] = useState(PLACEHOLDER_CODE)
  const [result, setResult] = useState<ExecuteResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [localResult, setLocalResult] = useState<LocalResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [sceneMind, setSceneMind] = useState<Mind | null>(null)
  const prevMindRef = useRef<Mind | null>(null)

  useEffect(() => {
    return () => {
      prevMindRef.current?.dispose()
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

  const handleExecute = useCallback(async () => {
    if (!code.trim()) return

    setParseError(null)
    setError(null)
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
        const mental = new Mental({
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

    setLocalResult({ log, mindCount, mentalCount })

    setLoading(true)
    try {
      const pythonCode = convertDslToPython(code)
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

  return (
    <main className="page cr-code-runner-page">
      <div className="cr-layout">
        <section className="cr-editor-panel">
          <div className="cr-editor-header">
            <div>
              <h1 className="cr-title">Code Runner</h1>
              <p className="cr-subtitle">
                Write or upload code using <code>Mind()</code> and <code>*Mental()</code> with <code>.add()</code> to create objects.
              </p>
            </div>
            <div className="cr-actions">
              <input ref={fileInputRef} type="file" accept=".py,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
              <button className="cr-btn cr-btn-secondary" onClick={() => fileInputRef.current?.click()}>
                Upload .py
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
                      <MindSphere mind={sceneMind} />
                    </Canvas>
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
