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
  _preview?: boolean
}

type ConnectionStatus = 'disconnected' | 'connected' | 'error'

type VariableRef = { type: 'mind' | 'mental'; id: number }

type WSMessage = WebSocketEventPayloads['message'] & {
  type?: string
  status?: string
  action?: string
  request_id?: string
  data?: any
  error?: string | any
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
  const pendingMentalsRef = useRef<Map<string, string>>(new Map())
  // Refs to track current state for retry logic
  const mindsRef = useRef<MindData[]>([])
  const mentalsRef = useRef<MentalData[]>([])

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
    // Handle error responses
    if (data.type === 'response' && data.status === 'error') {
      // eslint-disable-next-line no-console
      console.error('WebSocket error response:', data)
      const errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
      alert(`Error: ${errorMsg || 'Unknown error'}`)
      return
    }

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
          // Ensure mental_sphere_ids is always an array (never undefined)
          const updatedMind: MindData = { 
            ...mind, 
            variable,
            mental_sphere_ids: mind.mental_sphere_ids || []
          }
          const next = existing
            ? prev.map((m) => (m.id === mind.id ? updatedMind : m))
            : [...prev, updatedMind]
          mindsRef.current = next
          return next
        })
      } else if (data.action === 'upsert_mental' && data.data?.mental_sphere) {
        const mental = data.data.mental_sphere as MentalData
        const variable = data.request_id ? pendingMentalsRef.current.get(data.request_id) : undefined

        if (variable && data.request_id) {
          variableToIdRef.current.set(variable, { type: 'mental', id: mental.id })
          pendingMentalsRef.current.delete(data.request_id)
        }

        setMentals((prev) => {
          const existing = prev.find((m) => m.id === mental.id)
          const updatedMental: MentalData = { ...mental, variable }
          const next = existing
            ? prev.map((m) => (m.id === mental.id ? updatedMental : m))
            : [...prev, updatedMental]
          mentalsRef.current = next
          return next
        })
      } else if (data.action === 'append_mental' && data.data) {
        const mindId = data.data.mind_id as number
        const mentalIds = (data.data.mental_sphere_ids || []) as number[]
        setMinds((prev) => {
          const next = prev.map((m) => (m.id === mindId ? { ...m, mental_sphere_ids: mentalIds } : m))
          mindsRef.current = next
          return next
        })
      }
    } else if (data.type === 'update') {
      if (data.action === 'mind_updated' && data.data) {
        const mind = data.data as MindData
        
        // Validate that this is actually a mind (has required mind fields, not a mental sphere)
        // Mental spheres published to CHANNEL_MIND_UPDATES might be incorrectly treated as minds
        if (!mind.name || typeof mind.scale !== 'number' || !Array.isArray(mind.position)) {
          // This is likely a mental sphere or invalid data, ignore it
          return
        }
        
        setMinds((prev) => {
          const existing = prev.find((m) => m.id === mind.id)
          
          // Only update minds that were created in the current execution session
          // Ignore mind updates for minds that don't exist in current state and weren't created here
          // This prevents minds from other sessions/users from appearing
          if (!existing) {
            // Don't add new minds from broadcasts - only update existing ones
            return prev
          }
          
          // Ensure mental_sphere_ids is always an array (never undefined)
          const updatedMind: MindData = {
            ...mind,
            variable: existing.variable,
            mental_sphere_ids: mind.mental_sphere_ids || []
          }
          const next = prev.map((m) => (m.id === mind.id ? updatedMind : m))
          mindsRef.current = next
          return next
        })
      } else if (data.action === 'upsert_mental' && data.data?.mental_sphere) {
        const mental = data.data.mental_sphere as MentalData
        setMentals((prev) => {
          const existing = prev.find((m) => m.id === mental.id)
          const next = existing
            ? prev.map((m) => (m.id === mental.id ? { ...mental, variable: m.variable } : m))
            : [...prev, mental]
          mentalsRef.current = next
          return next
        })
      }
    } else if (data.type === 'preview') {
      if (data.action === 'upsert_mind' && data.data?.mind) {
        const mind = data.data.mind as MindData
        const variable = data.request_id ? pendingMindsRef.current.get(data.request_id) : undefined
        const previewMind: MindData = { ...mind, variable, _preview: true }

        setMinds((prev) => {
          const existing = prev.find((m) => m._preview && m.id === mind.id)
          const next = existing
            ? prev.map((m) => (m._preview && m.id === mind.id ? previewMind : m))
            : [...prev, previewMind]
          mindsRef.current = next
          return next
        })
      } else if (data.action === 'upsert_mental' && data.data?.mental_sphere) {
        const mental = data.data.mental_sphere as MentalData
        const variable = data.request_id ? pendingMentalsRef.current.get(data.request_id) : undefined
        const previewMental: MentalData = { ...mental, variable, _preview: true }

        setMentals((prev) => {
          const existing = prev.find((m) => m._preview && m.id === mental.id)
          const next = existing
            ? prev.map((m) => (m._preview && m.id === mental.id ? previewMental : m))
            : [...prev, previewMental]
          mentalsRef.current = next
          return next
        })
      }
    }
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
  }

  const updateMentalAttribute = (variable: string, attribute: string, value: string) => {
    setMentals((prev) => {
      const next = prev.map((m) => {
        if (m.variable !== variable) return m
        if (attribute === 'color') return { ...m, color: value }
        if (attribute === 'name') return { ...m, name: value }
        if (attribute === 'scale') return { ...m, scale: Number.parseFloat(value) || m.scale }
        return m
      })
      mentalsRef.current = next
      return next
    })
  }

  const handleExecute = (codeToExecute: string) => {
    if (!wsClient || !wsClient.connected) {
      alert('WebSocket not connected. Please wait...')
      return
    }

    // Clear the right side first
    setMinds([])
    setMentals([])
    mindsRef.current = []
    mentalsRef.current = []
    variableToIdRef.current.clear()
    pendingMindsRef.current.clear()
    pendingMentalsRef.current.clear()

    // If code is empty or whitespace-only, don't execute anything
    if (!codeToExecute || !codeToExecute.trim()) {
      return
    }

    try {
      const parser = new CodeParser()
      const actions = parser.parse(codeToExecute)

      // If no actions parsed, don't execute
      if (actions.length === 0) {
        return
      }

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
                  color: action.data.color || '#ffffff',
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
              // Filter out preview minds when looking for the target mind
              const mind = mindsRef.current.find(
                (m) =>
                  !m._preview &&
                  (m.variable === action.variable || (mindVarInfo && mindVarInfo.type === 'mind' && mindVarInfo.id === m.id)),
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

                // Update local state immediately to avoid color flicker
                setMinds((prev) => {
                  const next = prev.map((m) => (m.id === mind.id && !m._preview ? updatedMind : m))
                  mindsRef.current = next
                  return next
                })

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
                      !m._preview &&
                      (m.variable === action.variable ||
                        (mindVarInfo && mindVarInfo.id === m.id)),
                  )
                  if (retryMind) {
                    handleExecute(codeToExecute)
                  }
                }, 500)
              }
              break
            }

            case 'create_mental': {
              const requestId = `mental_${action.variable}_${Date.now()}_${index}`
              pendingMentalsRef.current.set(requestId, action.variable)

              wsClient.send({
                action: 'upsert_mental',
                data: {
                  name: action.data.name || 'Mental Sphere',
                  detail: '',
                  color: action.data.color || '#ff6b9d',
                  image: '',
                  position: action.data.position || [0.3, 0.2, 0.1],
                  rotation: [0, 0, 0], // Default rotation since it's not in the parsed action data
                  scale: action.data.scale || 0.1,
                  rec_status: true,
                },
                request_id: requestId,
              })
              break
            }

            case 'update_mental_attribute': {
              const mentalVarInfo = variableToIdRef.current.get(action.variable)
              // Filter out preview mentals
              const mental = mentalsRef.current.find(
                (m) =>
                  !m._preview &&
                  (m.variable === action.variable || (mentalVarInfo && mentalVarInfo.type === 'mental' && mentalVarInfo.id === m.id)),
              )

              if (mental) {
                const updatedMental: MentalData = { ...mental }
                if (action.attribute === 'color') {
                  updatedMental.color = action.value
                } else if (action.attribute === 'name') {
                  updatedMental.name = action.value
                } else if (action.attribute === 'scale') {
                  updatedMental.scale = Number.parseFloat(action.value) || updatedMental.scale
                }

                // Update local state immediately to avoid color flicker
                setMentals((prev) => {
                  const next = prev.map((m) => (m.id === mental.id && !m._preview ? updatedMental : m))
                  mentalsRef.current = next
                  return next
                })

                wsClient.send({
                  action: 'upsert_mental',
                  data: {
                    id: mental.id,
                    name: updatedMental.name,
                    detail: '',
                    color: updatedMental.color,
                    image: '',
                    position: mental.position || [0.3, 0.2, 0.1],
                    rotation: [0, 0, 0],
                    scale: updatedMental.scale,
                    rec_status: true,
                  },
                  request_id: `update_${action.variable}_${action.attribute}_${Date.now()}`,
                })
              } else {
                // eslint-disable-next-line no-console
                console.warn(
                  `Mental sphere with variable ${action.variable} not found yet. Waiting for creation...`,
                )
                setTimeout(() => {
                  const retryMental = mentals.find(
                    (m) =>
                      !m._preview &&
                      (m.variable === action.variable ||
                        (mentalVarInfo && mentalVarInfo.id === m.id)),
                  )
                  if (retryMental) {
                    // Use a callback to avoid setState during render
                    setTimeout(() => handleExecute(codeToExecute), 0)
                  }
                }, 500)
              }
              break
            }

            case 'add_mental_to_mind': {
              const mindVar = action.mindVariable
              const mentalVar = action.mentalVariable

              // Helper function to find and add mental - uses refs to get current state
              const tryAddMental = () => {
                const currentMinds = mindsRef.current
                const currentMentals = mentalsRef.current
                
                // Filter out preview minds
                const targetMind = currentMinds.find(
                  (m) =>
                    !m._preview &&
                    (m.variable === mindVar || variableToIdRef.current.get(mindVar)?.id === m.id),
                )
                
                // Check both by variable and by ID from ref, filter out preview mentals
                const mentalVarInfo = variableToIdRef.current.get(mentalVar)
                const targetMental = currentMentals.find(
                  (m) =>
                    !m._preview &&
                    (m.variable === mentalVar ||
                      (mentalVarInfo && mentalVarInfo.type === 'mental' && mentalVarInfo.id === m.id)),
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
                  return true
                }
                return false
              }

              // Try immediately first
              if (!tryAddMental()) {
                // If not found, wait and retry (up to 10 times = 5 seconds)
                let retryCount = 0
                const maxRetries = 10
                const retryInterval = 500

                const retryAddMental = () => {
                  retryCount++
                  if (tryAddMental()) {
                    return // Success, stop retrying
                  }
                  
                  if (retryCount < maxRetries) {
                    setTimeout(retryAddMental, retryInterval)
                  } else {
                    // eslint-disable-next-line no-console
                    console.warn(`Mind ${mindVar} or Mental ${mentalVar} not found after ${maxRetries} retries`)
                  }
                }

                setTimeout(retryAddMental, retryInterval)
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
              <MindWebsiteScene
                minds={minds.filter((m) => !m._preview)}
                mentals={mentals.filter((m) => {
                  // Filter out preview mental spheres
                  if (m._preview) return false;
                  
                  // Only include mental spheres that are explicitly added to at least one mind
                  // This ensures standalone mental spheres (created but not added) are never rendered
                  const isInAnyMind = minds.some(mind => 
                    mind.mental_sphere_ids && 
                    Array.isArray(mind.mental_sphere_ids) && 
                    mind.mental_sphere_ids.includes(m.id)
                  );
                  
                  return isInAnyMind;
                })}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}







