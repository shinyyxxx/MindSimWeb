import React, { useState, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8004'

interface MindResult {
  id: number
  name: string
  detail: string
  color: string
  rec_status: boolean
  position: number[]
  rotation: number[]
  scale: number
  mental_sphere_ids: number[]
  created_at: string
}

interface MentalResult {
  id: number
  name: string
  detail: string
  color: string
  image: string
  rec_status: boolean
  position: number[]
  rotation: number[]
  scale: number
  created_at: string
}

interface ExecuteResult {
  message: string
  created_minds: MindResult[]
  created_mentals: MentalResult[]
  execution_log: string[]
  summary: { minds_created: number; mentals_created: number }
}

const PLACEHOLDER_CODE = `x = Mind()
x.color = "#fe0000"
x.name = "mind1"

y = Mind()
y.detail = "test"
y.name = "mind2"

z = Mental()
z.name = "mental1"
y.append(z)`

export function CodeRunner(): React.ReactElement {
  const [code, setCode] = useState(PLACEHOLDER_CODE)
  const [result, setResult] = useState<ExecuteResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`${API_BASE}/api/execute_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    },
    [handleExecute],
  )

  return (
    <main className="page">
      <div className="cr-layout">
        <section className="cr-editor-panel">
          <div className="cr-editor-header">
            <div>
              <h1 className="cr-title">Code Runner</h1>
              <p className="cr-subtitle">
                Write or upload a <code>.py</code> file using <code>Mind()</code> and <code>Mental()</code> to create objects.
              </p>
            </div>
            <div className="cr-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept=".py,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
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
              {code.split('\n').map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <textarea
              className="cr-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder="x = Mind()&#10;x.name = &quot;my mind&quot;"
            />
          </div>

          <div className="cr-hint">
            <kbd>Cmd</kbd>+<kbd>Enter</kbd> to run &middot; <kbd>Tab</kbd> to indent
          </div>
        </section>

        <section className="cr-result-panel">
          {!result && !error && !loading && (
            <div className="cr-empty">
              <div className="cr-empty-icon">&#9654;</div>
              <p>Run your code to see results here</p>
            </div>
          )}

          {loading && (
            <div className="cr-empty">
              <div className="cr-spinner" />
              <p>Executing...</p>
            </div>
          )}

          {error && (
            <div className="cr-error-box">
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <>
              <div className="cr-summary">
                <span className="cr-summary-msg">{result.message}</span>
                <div className="cr-summary-badges">
                  <span className="cr-badge cr-badge-mind">
                    {result.summary.minds_created} Mind{result.summary.minds_created !== 1 && 's'}
                  </span>
                  <span className="cr-badge cr-badge-mental">
                    {result.summary.mentals_created} Mental{result.summary.mentals_created !== 1 && 's'}
                  </span>
                </div>
              </div>

              {result.execution_log.length > 0 && (
                <div className="cr-section">
                  <h3 className="cr-section-title">Execution Log</h3>
                  <div className="cr-log">
                    {result.execution_log.map((entry, i) => (
                      <div key={i} className="cr-log-entry">
                        <span className="cr-log-idx">{i + 1}</span>
                        {entry}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.created_minds.length > 0 && (
                <div className="cr-section">
                  <h3 className="cr-section-title">Created Minds</h3>
                  <div className="cr-cards">
                    {result.created_minds.map((mind) => (
                      <div key={mind.id} className="cr-card" style={{ borderLeftColor: mind.color }}>
                        <div className="cr-card-head">
                          <div className="cr-color-dot" style={{ background: mind.color }} />
                          <strong>{mind.name || `Mind #${mind.id}`}</strong>
                          <span className="cr-card-id">id: {mind.id}</span>
                        </div>
                        {mind.detail && <p className="cr-card-detail">{mind.detail}</p>}
                        <div className="cr-card-meta">
                          <span>pos: [{mind.position.map((v) => v.toFixed(1)).join(', ')}]</span>
                          <span>scale: {mind.scale}</span>
                          {mind.mental_sphere_ids.length > 0 && (
                            <span>mentals: [{mind.mental_sphere_ids.join(', ')}]</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.created_mentals.length > 0 && (
                <div className="cr-section">
                  <h3 className="cr-section-title">Created Mentals</h3>
                  <div className="cr-cards">
                    {result.created_mentals.map((mental) => (
                      <div key={mental.id} className="cr-card" style={{ borderLeftColor: mental.color }}>
                        <div className="cr-card-head">
                          <div className="cr-color-dot" style={{ background: mental.color }} />
                          <strong>{mental.name || `Mental #${mental.id}`}</strong>
                          <span className="cr-card-id">id: {mental.id}</span>
                        </div>
                        {mental.detail && <p className="cr-card-detail">{mental.detail}</p>}
                        <div className="cr-card-meta">
                          <span>pos: [{mental.position.map((v) => v.toFixed(1)).join(', ')}]</span>
                          <span>scale: {mental.scale}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
