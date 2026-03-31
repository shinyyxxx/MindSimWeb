import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import type { InspectSelection } from '../types/InspectSelection'

type InspectPanelProps = {
  selection: InspectSelection
  panelPosition?: { x: number; y: number } | null
  onClose: () => void
  onShowProfile?: (selection: InspectSelection) => void
  onMeasure?: (rect: DOMRect | null) => void
  onDragPositionChange?: (pos: { x: number; y: number }) => void
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

export function InspectPanel({
  selection,
  panelPosition,
  onClose,
  onShowProfile,
  onMeasure,
  onDragPositionChange,
}: InspectPanelProps) {
  const panelStyle = useMemo(() => computePanelStyle(selection, panelPosition), [selection, panelPosition])
  const panelRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef<{ dragging: boolean; offsetX: number; offsetY: number }>({
    dragging: false,
    offsetX: 0,
    offsetY: 0,
  })

  useLayoutEffect(() => {
    if (!panelRef.current) return
    const measure = () => {
      const rect = panelRef.current ? panelRef.current.getBoundingClientRect() : null
      onMeasure?.(rect)
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [panelStyle, onMeasure])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!dragStateRef.current.dragging || !panelRef.current) return
      const panel = panelRef.current
      const width = panel.offsetWidth || 320
      const height = panel.offsetHeight || 200
      const margin = 12
      const unclampedLeft = event.clientX - dragStateRef.current.offsetX
      const unclampedTop = event.clientY - dragStateRef.current.offsetY
      const left = Math.min(window.innerWidth - width - margin, Math.max(margin, unclampedLeft))
      const top = Math.min(window.innerHeight - height - margin, Math.max(margin, unclampedTop))
      const gap = 16
      onDragPositionChange?.({
        x: left + width / 2,
        y: top + height + gap,
      })
    }

    const onPointerUp = () => {
      dragStateRef.current.dragging = false
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [onDragPositionChange])

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!panelRef.current) return
    if ((event.target as HTMLElement).closest('button')) return
    const rect = panelRef.current.getBoundingClientRect()
    dragStateRef.current.dragging = true
    dragStateRef.current.offsetX = event.clientX - rect.left
    dragStateRef.current.offsetY = event.clientY - rect.top
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  return (
    <div ref={panelRef} className="inspect-panel" style={panelStyle ?? { top: 16, right: 16 }}>
      <div className="inspect-panel__bar" />
      <div className="inspect-panel__header" onPointerDown={handleDragStart} style={{ cursor: 'grab' }}>
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


