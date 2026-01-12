import React, { useState, useRef } from 'react'
import { StarterJigsaw } from './JigsawBlocks'
import './VisualCodeEditor.css'

type BlockType = 'create_mind' | 'create_mental' | 'set_attribute' | 'add_mental'

type CreateMindData = { variableName: string; name: string; color: string; scale: number }
type CreateMentalData = { variableName: string; name: string; color: string; scale: number }
type SetAttributeData = { target: string; attribute: string; value: string }
type AddMentalData = { mindVar: string; mentalVar: string }

type BlockData = CreateMindData | CreateMentalData | SetAttributeData | AddMentalData

type BlockTemplate = {
  type: BlockType
  label: string
  color: string
  category: string
}

type Block =
  | {
      id: number
      type: 'create_mind'
      label: string
      color: string
      x: number
      y: number
      data: CreateMindData
      nextBlockId?: number
      prevBlockId?: number
    }
  | {
      id: number
      type: 'create_mental'
      label: string
      color: string
      x: number
      y: number
      data: CreateMentalData
      nextBlockId?: number
      prevBlockId?: number
    }
  | {
      id: number
      type: 'set_attribute'
      label: string
      color: string
      x: number
      y: number
      data: SetAttributeData
      nextBlockId?: number
      prevBlockId?: number
    }
  | {
      id: number
      type: 'add_mental'
      label: string
      color: string
      x: number
      y: number
      data: AddMentalData
      nextBlockId?: number
      prevBlockId?: number
    }

export interface VisualCodeEditorProps {
  onCodeChange?: (code: string) => void
  onExecute?: (code: string) => void
}

function getDefaultDataForType(type: BlockType): BlockData {
  switch (type) {
    case 'create_mind':
      return { variableName: 'x', name: 'My Mind', color: '#ffffff', scale: 1.5 }
    case 'create_mental':
      return { variableName: 'y', name: 'Mental Sphere', color: '#ff6b9d', scale: 0.1 }
    case 'set_attribute':
      return { target: 'x', attribute: 'color', value: '#fe0000' }
    case 'add_mental':
      return { mindVar: 'x', mentalVar: 'y' }
  }
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return `"${value}"`
  }
  return String(value)
}

function generateCodeFromBlocks(blocks: Block[]): string {
  let code = ''

  // Find all root blocks (blocks with no previous block)
  const rootBlocks = blocks.filter((block) => !block.prevBlockId)

  // Sort root blocks by y position (top to bottom)
  const sortedRoots = [...rootBlocks].sort((a, b) => a.y - b.y)

  // Generate code for each chain starting from root blocks
  sortedRoots.forEach((rootBlock) => {
    let currentBlock: Block | undefined = rootBlock

    while (currentBlock) {
      switch (currentBlock.type) {
        case 'create_mind':
          code += `${currentBlock.data.variableName} = Mind()\n`
          if (currentBlock.data.name !== 'My Mind') {
            code += `${currentBlock.data.variableName}.name = "${currentBlock.data.name}"\n`
          }
          if (currentBlock.data.color !== '#ffffff') {
            code += `${currentBlock.data.variableName}.color = "${currentBlock.data.color}"\n`
          }
          if (currentBlock.data.scale !== 1.5) {
            code += `${currentBlock.data.variableName}.scale = ${currentBlock.data.scale}\n`
          }
          break
        case 'create_mental':
          code += `${currentBlock.data.variableName} = Mental()\n`
          if (currentBlock.data.name !== 'Mental Sphere') {
            code += `${currentBlock.data.variableName}.name = "${currentBlock.data.name}"\n`
          }
          if (currentBlock.data.color !== '#ff6b9d') {
            code += `${currentBlock.data.variableName}.color = "${currentBlock.data.color}"\n`
          }
          if (currentBlock.data.scale !== 0.1) {
            code += `${currentBlock.data.variableName}.scale = ${currentBlock.data.scale}\n`
          }
          break
        case 'set_attribute':
          code += `${currentBlock.data.target}.${currentBlock.data.attribute} = ${formatValue(currentBlock.data.value)}\n`
          break
        case 'add_mental':
          code += `${currentBlock.data.mindVar}.add(${currentBlock.data.mentalVar})\n`
          break
      }

      // Move to next block in chain
      currentBlock = currentBlock.nextBlockId ? blocks.find((b) => b.id === currentBlock.nextBlockId) : undefined
    }
  })

  return code
}

/**
 * Visual Code Editor Component
 * Allows users to build code using jigsaw blocks
 */
export function VisualCodeEditor({ onCodeChange, onExecute }: VisualCodeEditorProps): React.ReactElement {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [draggedBlock, setDraggedBlock] = useState<BlockTemplate | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [draggedPlacedBlock, setDraggedPlacedBlock] = useState<{ id: number; offsetX: number; offsetY: number } | null>(null)
  const [snapTarget, setSnapTarget] = useState<{ id: number; side: 'top' | 'bottom' } | null>(null)
  const blockRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const editorRef = useRef<HTMLDivElement | null>(null)

  // Block height constant (approximate height of a block)
  const BLOCK_HEIGHT = 50
  const SNAP_THRESHOLD = 30

  // Available block templates
  const blockTemplates: BlockTemplate[] = [
    { type: 'create_mind', label: 'Create Mind', color: '#4C97FF', category: 'mind' },
    { type: 'create_mental', label: 'Create Mental', color: '#FF8C1A', category: 'mental' },
    { type: 'set_attribute', label: 'Set Attribute', color: '#9966FF', category: 'attribute' },
    { type: 'add_mental', label: 'Add Mental', color: '#59C059', category: 'action' },
  ]

  const emitCodeChange = (nextBlocks: Block[]) => {
    if (!onCodeChange) return
    onCodeChange(generateCodeFromBlocks(nextBlocks))
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, template: BlockTemplate) => {
    setDraggedBlock(template)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!draggedBlock) return

    const editor = editorRef.current
    if (!editor) return

    const rect = editor.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newBlockBase = {
      id: Date.now() + Math.random(),
      type: draggedBlock.type,
      label: draggedBlock.label,
      color: draggedBlock.color,
      x,
      y,
      data: getDefaultDataForType(draggedBlock.type),
    } as const

    // Type-narrow the union based on `type`
    const newBlock = newBlockBase as unknown as Block

    setBlocks((prev) => {
      const next = [...prev, newBlock]
      emitCodeChange(next)
      return next
    })
    setDraggedBlock(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const updateBlockData = (blockId: number, newData: Partial<CreateMindData & CreateMentalData & SetAttributeData & AddMentalData>) => {
    setBlocks((prev) => {
      const next = prev.map((block) =>
        block.id === blockId ? ({ ...block, data: { ...(block as any).data, ...newData } } as Block) : block,
      )
      emitCodeChange(next)
      return next
    })
  }

  const deleteBlock = (blockId: number) => {
    setBlocks((prev) => {
      const blockToDelete = prev.find((b) => b.id === blockId)
      if (!blockToDelete) return prev

      // Disconnect the block from its neighbors
      const next = prev.map((block) => {
        if (block.nextBlockId === blockId) {
          return { ...block, nextBlockId: undefined } as Block
        }
        if (block.prevBlockId === blockId) {
          return { ...block, prevBlockId: undefined } as Block
        }
        return block
      })

      // Remove the block
      const filtered = next.filter((block) => block.id !== blockId)

      // Reconnect if there was a chain
      if (blockToDelete.prevBlockId && blockToDelete.nextBlockId) {
        const reconnected = filtered.map((block) => {
          if (block.id === blockToDelete.prevBlockId) {
            return { ...block, nextBlockId: blockToDelete.nextBlockId } as Block
          }
          if (block.id === blockToDelete.nextBlockId) {
            return { ...block, prevBlockId: blockToDelete.prevBlockId } as Block
          }
          return block
        })
        emitCodeChange(reconnected)
        return reconnected
      }

      emitCodeChange(filtered)
      return filtered
    })
  }

  const disconnectBlock = (blockId: number) => {
    setBlocks((prev) => {
      const block = prev.find((b) => b.id === blockId)
      if (!block) return prev

      const next = prev.map((b) => {
        if (b.id === blockId) {
          return { ...b, nextBlockId: undefined, prevBlockId: undefined } as Block
        }
        if (b.nextBlockId === blockId) {
          return { ...b, nextBlockId: undefined } as Block
        }
        if (b.prevBlockId === blockId) {
          return { ...b, prevBlockId: undefined } as Block
        }
        return b
      })

      emitCodeChange(next)
      return next
    })
  }

  const connectBlocks = (topBlockId: number, bottomBlockId: number) => {
    setBlocks((prev) => {
      const topBlock = prev.find((b) => b.id === topBlockId)
      const bottomBlock = prev.find((b) => b.id === bottomBlockId)

      if (!topBlock || !bottomBlock) return prev

      // Disconnect bottom block from its current parent if any
      // Also disconnect any block that currently has bottomBlock as nextBlockId
      let disconnected = prev.map((block) => {
        // If this block is the old parent of bottomBlock, disconnect it
        if (block.id === bottomBlock.prevBlockId && block.id !== topBlockId) {
          return { ...block, nextBlockId: undefined } as Block
        }
        // If this block has bottomBlock as nextBlockId but isn't the new parent, disconnect it
        if (block.nextBlockId === bottomBlockId && block.id !== topBlockId) {
          return { ...block, nextBlockId: undefined } as Block
        }
        return block
      })

      // Connect the blocks and position bottom block correctly
      const connected = disconnected.map((block) => {
        if (block.id === topBlockId) {
          return { ...block, nextBlockId: bottomBlockId } as Block
        }
        if (block.id === bottomBlockId) {
          // Position bottom block directly below top block
          const newY = topBlock.y + getBlockHeight(topBlock)
          return { ...block, prevBlockId: topBlockId, x: topBlock.x, y: newY } as Block
        }
        return block
      })

      // Move all blocks that were connected to bottom block
      let updated = connected
      let currentBlockId: number | undefined = bottomBlock.nextBlockId
      const offsetY = (topBlock.y + getBlockHeight(topBlock)) - bottomBlock.y

      while (currentBlockId) {
        const currentBlock = updated.find((b) => b.id === currentBlockId)
        if (!currentBlock) break

        updated = updated.map((block) =>
          block.id === currentBlockId
            ? ({ ...block, x: topBlock.x, y: block.y + offsetY } as Block)
            : block,
        )

        currentBlockId = currentBlock.nextBlockId
      }

      emitCodeChange(updated)
      return updated
    })
  }

  const getBlockHeight = (block: Block): number => {
    return BLOCK_HEIGHT
  }

  const findSnapTarget = (
    draggedBlockId: number,
    x: number,
    y: number,
    currentBlocks: Block[],
  ): { id: number; side: 'top' | 'bottom' } | null => {
    const draggedBlock = currentBlocks.find((b) => b.id === draggedBlockId)
    if (!draggedBlock) return null

    let bestTarget: { id: number; side: 'top' | 'bottom'; distance: number } | null = null

    currentBlocks.forEach((block) => {
      if (block.id === draggedBlockId) return

      const blockX = block.x
      const blockY = block.y
      const blockHeight = getBlockHeight(block)

      // Check if we're near the bottom connector (can attach below)
      const bottomY = blockY + blockHeight
      const distanceToBottom = Math.abs(x - blockX) + Math.abs(y - bottomY)

      if (distanceToBottom < SNAP_THRESHOLD && (!block.nextBlockId || block.nextBlockId === draggedBlockId)) {
        if (!bestTarget || distanceToBottom < bestTarget.distance) {
          bestTarget = { id: block.id, side: 'bottom', distance: distanceToBottom }
        }
      }

      // Check if we're near the top connector (can attach above)
      const distanceToTop = Math.abs(x - blockX) + Math.abs(y - blockY)

      if (distanceToTop < SNAP_THRESHOLD && (!block.prevBlockId || block.prevBlockId === draggedBlockId)) {
        if (!bestTarget || distanceToTop < bestTarget.distance) {
          bestTarget = { id: block.id, side: 'top', distance: distanceToTop }
        }
      }
    })

    return bestTarget ? { id: bestTarget.id, side: bestTarget.side } : null
  }

  const handleBlockMouseDown = (e: React.MouseEvent<HTMLDivElement>, block: Block) => {
    // Don't start dragging if clicking on inputs or buttons
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') {
      return
    }

    const editor = editorRef.current
    if (!editor) return

    const rect = editor.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - block.x
    const offsetY = e.clientY - rect.top - block.y

    setDraggedPlacedBlock({ id: block.id, offsetX, offsetY })
    setSelectedBlock(block)
    e.preventDefault()
  }

  // Add global mouse move and up handlers for dragging
  React.useEffect(() => {
    if (!draggedPlacedBlock) {
      setSnapTarget(null)
      return
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const editor = editorRef.current
      if (!editor) return

      const rect = editor.getBoundingClientRect()
      const newX = e.clientX - rect.left - draggedPlacedBlock.offsetX
      const newY = e.clientY - rect.top - draggedPlacedBlock.offsetY

      setBlocks((prev) => {
        const draggedBlock = prev.find((b) => b.id === draggedPlacedBlock.id)
        if (!draggedBlock) return prev

        // Find snap target using current blocks state
        const target = findSnapTarget(draggedPlacedBlock.id, newX, newY, prev)
        setSnapTarget(target)

        // Calculate new position
        let finalX = newX
        let finalY = newY

        // If snapping, adjust position
        if (target) {
          const targetBlock = prev.find((b) => b.id === target.id)
          if (targetBlock) {
            finalX = targetBlock.x
            if (target.side === 'bottom') {
              finalY = targetBlock.y + getBlockHeight(targetBlock)
            } else {
              finalY = targetBlock.y - getBlockHeight(draggedBlock)
            }
          }
        }

        // Update dragged block position
        let updated = prev.map((block) =>
          block.id === draggedPlacedBlock.id ? ({ ...block, x: finalX, y: finalY } as Block) : block,
        )

        // Move connected blocks if dragging the top of a chain
        if (!draggedBlock.prevBlockId) {
          const offsetY = finalY - draggedBlock.y
          const offsetX = finalX - draggedBlock.x

          // Move all connected blocks in the chain
          let currentBlockId: number | undefined = draggedBlock.nextBlockId
          while (currentBlockId) {
            const currentBlock = updated.find((b) => b.id === currentBlockId)
            if (!currentBlock) break

            updated = updated.map((block) =>
              block.id === currentBlockId
                ? ({ ...block, x: block.x + offsetX, y: block.y + offsetY } as Block)
                : block,
            )

            currentBlockId = currentBlock.nextBlockId
          }
        }

        return updated
      })
    }

    const handleGlobalMouseUp = () => {
      if (draggedPlacedBlock && snapTarget) {
        // Connect the blocks
        if (snapTarget.side === 'bottom') {
          connectBlocks(snapTarget.id, draggedPlacedBlock.id)
        } else {
          connectBlocks(draggedPlacedBlock.id, snapTarget.id)
        }
      } else if (draggedPlacedBlock) {
        // Disconnect if moved away
        const draggedBlock = blocks.find((b) => b.id === draggedPlacedBlock.id)
        if (draggedBlock && (draggedBlock.prevBlockId || draggedBlock.nextBlockId)) {
          // Only disconnect if moved significantly
          const blockEl = blockRefs.current.get(draggedPlacedBlock.id)
          if (blockEl) {
            const rect = blockEl.getBoundingClientRect()
            const editor = editorRef.current
            if (editor) {
              const editorRect = editor.getBoundingClientRect()
              const blockX = rect.left - editorRect.left
              const blockY = rect.top - editorRect.top
              const originalBlock = blocks.find((b) => b.id === draggedPlacedBlock.id)
              if (originalBlock) {
                const distance = Math.abs(blockX - originalBlock.x) + Math.abs(blockY - originalBlock.y)
                if (distance > SNAP_THRESHOLD * 2) {
                  disconnectBlock(draggedPlacedBlock.id)
                }
              }
            }
          }
        }
      }
      setDraggedPlacedBlock(null)
      setSnapTarget(null)
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [draggedPlacedBlock, blocks, snapTarget])

  const renderBlock = (block: Block) => {
    const isSelected = selectedBlock?.id === block.id
    const isSnapTarget = snapTarget?.id === block.id
    const isConnected = block.prevBlockId !== undefined || block.nextBlockId !== undefined

    const blockClassName = `code-block ${isSelected ? 'selected' : ''} ${isSnapTarget ? 'snap-target' : ''} ${isConnected ? 'connected' : ''}`

    switch (block.type) {
      case 'create_mind':
        return (
          <div
            key={block.id}
            ref={(el) => {
              if (el) blockRefs.current.set(block.id, el)
              else blockRefs.current.delete(block.id)
            }}
            className={blockClassName}
            style={{ left: block.x, top: block.y }}
            onClick={() => setSelectedBlock(block)}
            onMouseDown={(e) => handleBlockMouseDown(e, block)}
          >
            <StarterJigsaw color={block.color}>
              <div className="block-content">
                <input
                  type="text"
                  value={block.data.variableName}
                  onChange={(e) => updateBlockData(block.id, { variableName: e.target.value })}
                  className="block-input"
                  onClick={(e) => e.stopPropagation()}
                />
                <span> = Mind()</span>
              </div>
            </StarterJigsaw>
            <button className="block-delete" onClick={() => deleteBlock(block.id)}>
              ×
            </button>
          </div>
        )
      case 'create_mental':
        return (
          <div
            key={block.id}
            ref={(el) => {
              if (el) blockRefs.current.set(block.id, el)
              else blockRefs.current.delete(block.id)
            }}
            className={blockClassName}
            style={{ left: block.x, top: block.y }}
            onClick={() => setSelectedBlock(block)}
            onMouseDown={(e) => handleBlockMouseDown(e, block)}
          >
            <StarterJigsaw color={block.color}>
              <div className="block-content">
                <input
                  type="text"
                  value={block.data.variableName}
                  onChange={(e) => updateBlockData(block.id, { variableName: e.target.value })}
                  className="block-input"
                  onClick={(e) => e.stopPropagation()}
                />
                <span> = Mental()</span>
              </div>
            </StarterJigsaw>
            <button className="block-delete" onClick={() => deleteBlock(block.id)}>
              ×
            </button>
          </div>
        )
      case 'set_attribute':
        return (
          <div
            key={block.id}
            ref={(el) => {
              if (el) blockRefs.current.set(block.id, el)
              else blockRefs.current.delete(block.id)
            }}
            className={blockClassName}
            style={{ left: block.x, top: block.y }}
            onClick={() => setSelectedBlock(block)}
            onMouseDown={(e) => handleBlockMouseDown(e, block)}
          >
            <StarterJigsaw color={block.color}>
              <div className="block-content">
                <input
                  type="text"
                  value={block.data.target}
                  onChange={(e) => updateBlockData(block.id, { target: e.target.value })}
                  className="block-input small"
                  onClick={(e) => e.stopPropagation()}
                />
                <span>.</span>
                <input
                  type="text"
                  value={block.data.attribute}
                  onChange={(e) => updateBlockData(block.id, { attribute: e.target.value })}
                  className="block-input small"
                  onClick={(e) => e.stopPropagation()}
                />
                <span> = </span>
                <input
                  type="text"
                  value={block.data.value}
                  onChange={(e) => updateBlockData(block.id, { value: e.target.value })}
                  className="block-input"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </StarterJigsaw>
            <button className="block-delete" onClick={() => deleteBlock(block.id)}>
              ×
            </button>
          </div>
        )
      case 'add_mental':
        return (
          <div
            key={block.id}
            ref={(el) => {
              if (el) blockRefs.current.set(block.id, el)
              else blockRefs.current.delete(block.id)
            }}
            className={blockClassName}
            style={{ left: block.x, top: block.y }}
            onClick={() => setSelectedBlock(block)}
            onMouseDown={(e) => handleBlockMouseDown(e, block)}
          >
            <StarterJigsaw color={block.color}>
              <div className="block-content">
                <input
                  type="text"
                  value={block.data.mindVar}
                  onChange={(e) => updateBlockData(block.id, { mindVar: e.target.value })}
                  className="block-input small"
                  onClick={(e) => e.stopPropagation()}
                />
                <span>.add(</span>
                <input
                  type="text"
                  value={block.data.mentalVar}
                  onChange={(e) => updateBlockData(block.id, { mentalVar: e.target.value })}
                  className="block-input small"
                  onClick={(e) => e.stopPropagation()}
                />
                <span>)</span>
              </div>
            </StarterJigsaw>
            <button className="block-delete" onClick={() => deleteBlock(block.id)}>
              ×
            </button>
          </div>
        )
      default:
        return null
    }
  }

  const currentCode = generateCodeFromBlocks(blocks)

  return (
    <div className="visual-code-editor">
      <div className="block-palette">
        <h3>Blocks</h3>
        <div className="block-templates">
          {blockTemplates.map((template) => (
            <div
              key={template.type}
              className="block-template"
              draggable
              onDragStart={(e) => handleDragStart(e, template)}
              style={{ ['--template-color' as any]: template.color }}
            >
              {template.label}
            </div>
          ))}
        </div>
        <button className="execute-button" onClick={() => onExecute && onExecute(currentCode)}>
          Execute
        </button>
      </div>
      <div
        ref={editorRef}
        className="block-editor"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => setSelectedBlock(null)}
      >
        {blocks.length === 0 && <div className="empty-editor">Drag blocks here to build your code</div>}
        {blocks.map(renderBlock)}
      </div>
    </div>
  )
}







