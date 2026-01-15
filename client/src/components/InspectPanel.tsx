import React, { useMemo } from 'react'
import type { InspectSelection } from '../types/InspectSelection'

type InspectPanelProps = {
  selection: InspectSelection
  panelPosition?: { x: number; y: number } | null
  onClose: () => void
  onShowProfile?: (selection: InspectSelection) => void
}

function computePanelStyle(selection: InspectSelection, panelPosition?: { x: number; y: number } | null) {
  const panelWidth = 320
  const panelHeight = 200
  const gap = 16
  const margin = 12
  const baseX = panelPosition?.x ?? selection.screenPosition?.x ?? margin
  const baseY = panelPosition?.y ?? selection.screenPosition?.y ?? margin

  if (typeof window === 'undefined') {
    return { left: baseX - panelWidth / 2, top: baseY - panelHeight - gap, width: panelWidth }
  }

  const unclampedLeft = baseX - panelWidth / 2
  const unclampedTop = baseY - panelHeight - gap

  const left = Math.min(window.innerWidth - panelWidth - margin, Math.max(margin, unclampedLeft))
  const top = Math.min(window.innerHeight - panelHeight - margin, Math.max(margin, unclampedTop))

  return { left, top, width: panelWidth }
}

export function InspectPanel({ selection, panelPosition, onClose, onShowProfile }: InspectPanelProps) {
  const panelStyle = useMemo(() => computePanelStyle(selection, panelPosition), [selection, panelPosition])

  return (
    <div className="inspect-panel" style={panelStyle ?? { top: 16, right: 16 }}>
      <div className="inspect-panel__bar" />
      <div className="inspect-panel__header">
        <div>
          <div className="inspect-panel__eyebrow">Mental #{selection.labelNumber}</div>
          <div className="inspect-panel__title">{selection.name}</div>
        </div>
        <button className="inspect-panel__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <p className="inspect-panel__body">{selection.detail || 'No detail provided.'}</p>
      <div className="inspect-panel__meta">
        <span className="inspect-panel__dot" />
        <span>Type: {selection.type || 'n/a'}</span>
      </div>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="inspect-panel__more"
          onClick={() => onShowProfile?.(selection)}
          type="button"
        >
          More detail
        </button>
      </div>
    </div>
  )
}

export default InspectPanel


