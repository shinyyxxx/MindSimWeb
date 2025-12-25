/**
 * WebSocket Client for MindSim
 * Handles connection and message sending to backend
 */

export type WebSocketEventPayloads = {
  connected: void
  disconnected: void
  message: unknown
  error: unknown
}

type WebSocketEventName = keyof WebSocketEventPayloads
type Listener<E extends WebSocketEventName> = (payload: WebSocketEventPayloads[E]) => void

export class WebSocketClient {
  url: string
  userId: string
  ws: WebSocket | null
  reconnectAttempts: number
  maxReconnectAttempts: number
  listeners: Map<WebSocketEventName, Array<(payload: unknown) => void>>
  connected: boolean
  pendingMessages: unknown[]

  constructor(url: string, userId?: string) {
    this.url = url
    this.userId = userId || `user_${Math.floor(Math.random() * 10000)}`
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.listeners = new Map()
    this.connected = false
    this.pendingMessages = []
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.url}/ws/${this.userId}`
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          this.connected = true
          this.reconnectAttempts = 0
          // eslint-disable-next-line no-console
          console.log('WebSocket connected')

          while (this.pendingMessages.length > 0) {
            const message = this.pendingMessages.shift()
            this.send(message)
          }

          this.emit('connected', undefined)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data as string) as unknown
            this.emit('message', data)
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          // eslint-disable-next-line no-console
          console.error('WebSocket error:', error)
          this.emit('error', error)
          reject(error)
        }

        this.ws.onclose = () => {
          this.connected = false
          // eslint-disable-next-line no-console
          console.log('WebSocket disconnected')
          this.emit('disconnected', undefined)

          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            setTimeout(() => {
              // eslint-disable-next-line no-console
              console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`)
              this.connect().catch(() => {})
            }, 2000 * this.reconnectAttempts)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  send(message: unknown): boolean {
    if (!this.connected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.pendingMessages.push(message)
      return false
    }

    try {
      this.ws.send(JSON.stringify(message))
      return true
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error sending WebSocket message:', error)
      return false
    }
  }

  on<E extends WebSocketEventName>(event: E, callback: Listener<E>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback as (payload: unknown) => void)
  }

  off<E extends WebSocketEventName>(event: E, callback: Listener<E>): void {
    const callbacks = this.listeners.get(event)
    if (!callbacks) return
    const index = callbacks.indexOf(callback as (payload: unknown) => void)
    if (index > -1) callbacks.splice(index, 1)
  }

  emit<E extends WebSocketEventName>(event: E, payload: WebSocketEventPayloads[E]): void {
    const callbacks = this.listeners.get(event)
    if (!callbacks) return
    callbacks.forEach((callback) => {
      try {
        callback(payload as unknown)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error in event listener for ${String(event)}:`, error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.connected = false
    this.listeners.clear()
  }
}







