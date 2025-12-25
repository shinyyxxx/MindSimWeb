import React, { useState, useEffect, useRef } from 'react'
import { MindWebsiteScene } from '../mindwebsite/MindWebsiteScene'
import { VisualCodeEditor } from '../components/VisualCodeEditor'
import { CodeParser, type ParsedAction } from '../utils/codeParser'
import { WebSocketClient, type WebSocketEventPayloads } from '../utils/websocketClient'

type Vec3 = [number, number, number]

interface MindData {
  id: number
  name: string
  color: string
  position: Vec3
  rotation?: Vec3
  scale: number
  detail?: string
  mental_sphere_ids?: number[]
  variable?: string
  _preview?: boolean
}

interface MentalData {
  id: number
  name: string
  color: string
  scale: number
  position: Vec3
  variable?: string
}

type ConnectionStatus = 'disconnected' | 'connected' | 'error'

type VariableRef = { type: 'mind' | 'mental'; id: number }

type WSMessage = WebSocketEventPayloads['message'] & {
  type?: string
  status?: string
  action?: string
  request_id?: string
  data?: any
}

export function Playground(): React.ReactElement {
  const [_code, setCode] = useState<string>('')
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null)
  const [minds, setMinds] = useState<MindData[]>([])
  const [mentals, setMentals] = useState<MentalData[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')

  const wsClientRef = useRef<WebSocketClient | null>(null)
  const variableToIdRef = useRef<Map<string, VariableRef>>(new Map())
  const pendingMindsRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    const client = new WebSocketClient(
      import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
      `user_${Math.floor(Math.random() * 10000)}`,
    )

    client.on('connected', () => {
      setConnectionStatus('connected')
      // eslint-disable-next-line no-console
      console.log('WebSocket connected')
    })

    client.on('disconnected', () => {
      setConnectionStatus('disconnected')
      // eslint-disable-next-line no-console
      console.log('WebSocket disconnected')
    })

    client.on('message', (data) => {
      // eslint-disable-next-line no-console
      console.log('WebSocket message received:', data)
      handleWebSocketMessage(data as WSMessage)
    })

    client.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.error('WebSocket error:', error)
      setConnectionStatus('error')
    })

    client.connect().catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err)
    })
    wsClientRef.current = client
    setWsClient(client)

    return () => {
      client.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleWebSocketMessage = (data: WSMessage) => {
    if (data.type === 'response' && data.status === 'success') {
      if (data.action === 'upsert_mind' && data.data?.mind) {
        const mind = data.data.mind as MindData
        const variable = data.request_id ? pendingMindsRef.current.get(data.request_id) : undefined

        if (variable && data.request_id) {
          variableToIdRef.current.set(variable, { type: 'mind', id: mind.id })
          pendingMindsRef.current.delete(data.request_id)
        }

        setMinds((prev) => {
          const existing = prev.find((m) => m.id === mind.id)
          const updatedMind: MindData = { ...mind, variable }
          if (existing) {
            return prev.map((m) => (m.id === mind.id ? updatedMind : m))
          }
          return [...prev, updatedMind]
        })
      } else if (data.action === 'append_mental' && data.data) {
        const mindId = data.data.mind_id as number
        const mentalIds = (data.data.mental_sphere_ids || []) as number[]
        setMinds((prev) =>
          prev.map((m) => (m.id === mindId ? { ...m, mental_sphere_ids: mentalIds } : m)),
        )
      }
    } else if (data.type === 'update') {
      if (data.action === 'mind_updated' && data.data) {
        const mind = data.data as MindData
        setMinds((prev) => {
          const existing = prev.find((m) => m.id === mind.id)
          if (existing) {
            return prev.map((m) => (m.id === mind.id ? { ...mind, variable: m.variable } : m))
          }
          return [...prev, mind]
        })
      }
    } else if (data.type === 'preview') {
      if (data.action === 'upsert_mind' && data.data?.mind) {
        const mind = data.data.mind as MindData
        const variable = data.request_id ? pendingMindsRef.current.get(data.request_id) : undefined
        const previewMind: MindData = { ...mind, variable, _preview: true }

        setMinds((prev) => {
          const existing = prev.find((m) => m._preview && m.id === mind.id)
          if (existing) {
            return prev.map((m) => (m._preview && m.id === mind.id ? previewMind : m))
          }
          return [...prev, previewMind]
        })
      }
    }
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  const updateMentalAttribute = (variable: string, attribute: string, value: string) => {
    setMentals((prev) =>
      prev.map((m) => {
        if (m.variable !== variable) return m
        if (attribute === 'color') return { ...m, color: value }
        if (attribute === 'name') return { ...m, name: value }
        if (attribute === 'scale') return { ...m, scale: Number.parseFloat(value) || m.scale }
        return m
      }),
    )
  }

  const handleExecute = (codeToExecute: string) => {
    if (!wsClient || !wsClient.connected) {
      alert('WebSocket not connected. Please wait...')
      return
    }

    try {
      const parser = new CodeParser()
      const actions = parser.parse(codeToExecute)

      variableToIdRef.current.clear()
      pendingMindsRef.current.clear()

      actions.forEach((action: ParsedAction, index: number) => {
        setTimeout(() => {
          switch (action.type) {
            case 'create_mind': {
              const requestId = `mind_${action.variable}_${Date.now()}_${index}`
              pendingMindsRef.current.set(requestId, action.variable)

              wsClient.send({
                action: 'upsert_mind',
                data: {
                  name: action.data.name || 'My Mind',
                  detail: '',
                  color: action.data.color || '#3cdd8c',
                  position: action.data.position || [0, 0, 0],
                  rotation: action.data.rotation || [0, 0, 0],
                  scale: action.data.scale || 1.5,
                  rec_status: true,
                },
                request_id: requestId,
              })
              break
            }

            case 'update_mind_attribute': {
              const mindVarInfo = variableToIdRef.current.get(action.variable)
              const mind = minds.find(
                (m) =>
                  m.variable === action.variable || (mindVarInfo && mindVarInfo.id === m.id),
              )

              if (mind) {
                const updatedMind: MindData = { ...mind }
                if (action.attribute === 'color') {
                  updatedMind.color = action.value
                } else if (action.attribute === 'name') {
                  updatedMind.name = action.value
                } else if (action.attribute === 'scale') {
                  updatedMind.scale = Number.parseFloat(action.value) || updatedMind.scale
                }

                wsClient.send({
                  action: 'upsert_mind',
                  data: {
                    id: mind.id,
                    name: updatedMind.name,
                    detail: mind.detail || '',
                    color: updatedMind.color,
                    position: mind.position || [0, 0, 0],
                    rotation: mind.rotation || [0, 0, 0],
                    scale: updatedMind.scale,
                    rec_status: true,
                  },
                  request_id: `update_${action.variable}_${action.attribute}_${Date.now()}`,
                })
              } else {
                // eslint-disable-next-line no-console
                console.warn(
                  `Mind with variable ${action.variable} not found yet. Waiting for creation...`,
                )
                setTimeout(() => {
                  const retryMind = minds.find(
                    (m) =>
                      m.variable === action.variable ||
                      (mindVarInfo && mindVarInfo.id === m.id),
                  )
                  if (retryMind) {
                    handleExecute(codeToExecute)
                  }
                }, 500)
              }
              break
            }

            case 'create_mental': {
              const mentalId = Date.now()
              variableToIdRef.current.set(action.variable, { type: 'mental', id: mentalId })

              const mental: MentalData = {
                id: mentalId,
                name: action.data.name || 'Mental Sphere',
                color: action.data.color || '#ff6b9d',
                scale: action.data.scale || 0.1,
                position: action.data.position || [0.3, 0.2, 0.1],
                variable: action.variable,
              }

              setMentals((prev) => {
                const existing = prev.find((m) => m.variable === action.variable)
                if (existing) {
                  return prev.map((m) => (m.variable === action.variable ? mental : m))
                }
                return [...prev, mental]
              })
              break
            }

            case 'update_mental_attribute': {
              updateMentalAttribute(action.variable, action.attribute, action.value)
              break
            }

            case 'add_mental_to_mind': {
              const mindVar = action.mindVariable
              const mentalVar = action.mentalVariable

              const targetMind = minds.find(
                (m) => m.variable === mindVar || variableToIdRef.current.get(mindVar)?.id === m.id,
              )
              const targetMental = mentals.find(
                (m) => m.variable === mentalVar || m.id === variableToIdRef.current.get(mentalVar)?.id,
              )

              if (targetMind && targetMental) {
                wsClient.send({
                  action: 'append_mental',
                  data: {
                    mind_id: targetMind.id,
                    sphere_id: [targetMental.id],
                  },
                  request_id: `add_${mindVar}_${mentalVar}_${Date.now()}`,
                })
              } else {
                // eslint-disable-next-line no-console
                console.warn(`Mind ${mindVar} or Mental ${mentalVar} not found`)
              }
              break
            }
          }
        }, index * 200)
      })
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error executing code:', error)
      const message = error instanceof Error ? error.message : String(error)
      alert(`Error: ${message}`)
    }
  }

  return (
    <main className="page">
      <div className="playground">
        <section className="playground-left">
          <div className="playground-header">
            <div>
              <h1 className="playground-title">Playground</h1>
              <p className="playground-subtitle">
                Build your code using visual blocks. The 3D scene will update in real-time.
              </p>
            </div>
            <div className="playground-meta">
              <span
                style={{
                  color: connectionStatus === 'connected' ? '#10b981' : '#ef4444',
                  fontSize: '10px',
                  marginRight: '8px',
                }}
              >
                ●
              </span>
              {connectionStatus}
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <VisualCodeEditor onCodeChange={handleCodeChange} onExecute={handleExecute} />
          </div>
        </section>

        <section className="playground-right">
          <div className="playground-canvas-wrap">
            <div className="playground-canvas">
              <MindWebsiteScene minds={minds} mentals={mentals} />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}







