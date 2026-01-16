import React, { useState, useRef } from 'react'
import { StarterJigsaw } from './JigsawBlocks'
import './VisualCodeEditor.css'

type BlockType = 'create_mind' | 'create_mental' | 'set_attribute' | 'add_mental'

type CreateMindData = { variableName: string; name: string; color: string; scale: number }
type CreateMentalData = { variableName: string; name: string; color: string; scale: number }
type SetAttributeData = { 
  target: string
  color: string
  name: string
  scale: string
  enableColor: boolean
  enableName: boolean
  enableScale: boolean
}
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

type CodeExample = {
  id: string
  title: string
  description: string
  code: string
  category: 'basic' | 'intermediate' | 'advanced'
}

function getDefaultDataForType(type: BlockType): BlockData {
  switch (type) {
    case 'create_mind':
      return { variableName: 'x', name: 'My Mind', color: '#ffffff', scale: 1.5 }
    case 'create_mental':
      return { variableName: 'y', name: 'Mental Sphere', color: '#ff6b9d', scale: 0.1 }
    case 'set_attribute':
      return { target: 'x', color: '#fe0000', name: '', scale: '1.5', enableColor: true, enableName: false, enableScale: false }
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
          if (currentBlock.data.enableColor && currentBlock.data.color) {
            code += `${currentBlock.data.target}.color = ${formatValue(currentBlock.data.color)}\n`
          }
          if (currentBlock.data.enableName && currentBlock.data.name) {
            code += `${currentBlock.data.target}.name = ${formatValue(currentBlock.data.name)}\n`
          }
          if (currentBlock.data.enableScale && currentBlock.data.scale) {
            code += `${currentBlock.data.target}.scale = ${currentBlock.data.scale}\n`
          }
          break
        case 'add_mental':
          code += `${currentBlock.data.mindVar}.add(${currentBlock.data.mentalVar})\n`
          break
      }

      // Move to next block in chain
      const nextBlockId: number | undefined = currentBlock.nextBlockId
      currentBlock = nextBlockId ? blocks.find((b) => b.id === nextBlockId) : undefined
    }
  })

  return code
}

// Example code templates
const CODE_EXAMPLES: CodeExample[] = [
  {
    id: 'basic-mind',
    title: 'Basic Mind',
    description: 'Create a simple mind',
    code: 'x = Mind()',
    category: 'basic'
  },
  {
    id: 'colored-mind',
    title: 'Colored Mind',
    description: 'Create a mind with custom color',
    code: 'x = Mind()\nx.color = "#ff0000"',
    category: 'basic'
  },
  {
    id: 'mind-with-mental',
    title: 'Mind + Mental',
    description: 'Create a mind and attach a mental sphere',
    code: 'x = Mind()\ny = Mental()\nx.add(y)',
    category: 'intermediate'
  },
  {
    id: 'multiple-mentals',
    title: 'Multiple Mental Spheres',
    description: 'Create a mind with multiple mental spheres',
    code: 'x = Mind()\ny = Mental()\nz = Mental()\nz.color = "#00ff00"\nx.add(y)\nx.add(z)',
    category: 'intermediate'
  },
  {
    id: 'styled-mind',
    title: 'Styled Mind',
    description: 'Create a fully customized mind',
    code: 'x = Mind()\nx.color = "#9966ff"\nx.name = "Creative Mind"\nx.scale = 2.0',
    category: 'intermediate'
  },
  {
    id: 'complex-structure',
    title: 'Complex Structure',
    description: 'Create multiple minds with styled mental spheres',
    code: 'x = Mind()\nx.color = "#ff6b9d"\ny = Mental()\ny.color = "#00d4ff"\ny.name = "Perception"\nz = Mental()\nz.color = "#00ff88"\nz.name = "Feeling"\nx.add(y)\nx.add(z)',
    category: 'advanced'
  }
]

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
  const [showExamples, setShowExamples] = useState<boolean>(false)
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

  const loadExample = (example: CodeExample) => {
    // Clear existing blocks
    setBlocks([])
    setShowExamples(false)
    
    // Parse the example code into blocks
    const lines = example.code.split('\n').filter(line => line.trim())
    const newBlocks: Block[] = []
    let yPosition = 50
    const xPosition = 100
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      let blockHeight = BLOCK_HEIGHT
      
      // Parse: x = Mind()
      if (/^\w+\s*=\s*Mind\(\)/.test(trimmed)) {
        const match = trimmed.match(/^(\w+)\s*=\s*Mind\(\)/)
        if (match) {
          const varName = match[1]
          const block: Block = {
            id: Date.now() + index,
            type: 'create_mind',
            label: 'Create Mind',
            color: '#4C97FF',
            x: xPosition,
            y: yPosition,
            data: { variableName: varName, name: 'My Mind', color: '#ffffff', scale: 1.5 },
            prevBlockId: index > 0 ? Date.now() + index - 1 : undefined
          }
          if (index > 0) {
            newBlocks[index - 1].nextBlockId = block.id
          }
          newBlocks.push(block)
          blockHeight = 68
        }
      }
      // Parse: y = Mental()
      else if (/^\w+\s*=\s*Mental\(\)/.test(trimmed)) {
        const match = trimmed.match(/^(\w+)\s*=\s*Mental\(\)/)
        if (match) {
          const varName = match[1]
          const block: Block = {
            id: Date.now() + index,
            type: 'create_mental',
            label: 'Create Mental',
            color: '#FF8C1A',
            x: xPosition,
            y: yPosition,
            data: { variableName: varName, name: 'Mental Sphere', color: '#ff6b9d', scale: 0.1 },
            prevBlockId: index > 0 ? Date.now() + index - 1 : undefined
          }
          if (index > 0) {
            newBlocks[index - 1].nextBlockId = block.id
          }
          newBlocks.push(block)
          blockHeight = 68
        }
      }
      // Parse: x.add(y)
      else if (/^\w+\.add\((\w+)\)/.test(trimmed)) {
        const match = trimmed.match(/^(\w+)\.add\((\w+)\)/)
        if (match) {
          const block: Block = {
            id: Date.now() + index,
            type: 'add_mental',
            label: 'Add Mental',
            color: '#59C059',
            x: xPosition,
            y: yPosition,
            data: { mindVar: match[1], mentalVar: match[2] },
            prevBlockId: index > 0 ? Date.now() + index - 1 : undefined
          }
          if (index > 0) {
            newBlocks[index - 1].nextBlockId = block.id
          }
          newBlocks.push(block)
        }
      }
      // Parse: x.attribute = value (set attribute)
      else if (/^\w+\.\w+\s*=\s*.+/.test(trimmed)) {
        const match = trimmed.match(/^(\w+)\.(\w+)\s*=\s*(.+)/)
        if (match) {
          const varName = match[1]
          const attribute = match[2]
          let value = match[3].trim()
          
          // Remove quotes
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          
          const block: Block = {
            id: Date.now() + index,
            type: 'set_attribute',
            label: 'Set Attribute',
            color: '#9966FF',
            x: xPosition,
            y: yPosition,
            data: {
              target: varName,
              color: attribute === 'color' ? value : '#fe0000',
              name: attribute === 'name' ? value : '',
              scale: attribute === 'scale' ? value : '1.5',
              enableColor: attribute === 'color',
              enableName: attribute === 'name',
              enableScale: attribute === 'scale'
            },
            prevBlockId: index > 0 ? Date.now() + index - 1 : undefined
          }
          if (index > 0) {
            newBlocks[index - 1].nextBlockId = block.id
          }
          newBlocks.push(block)
          blockHeight = 124
        }
      }
      
      yPosition += blockHeight + 10
    })
    
    setBlocks(newBlocks)
    emitCodeChange(newBlocks)
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

  const updateBlockData = (blockId: number, newData: Partial<CreateMindData & CreateMentalData & SetAttributeData & AddMentalData> | Record<string, any>) => {
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
    if (block.type === 'set_attribute') {
      // Calculate based on actual content: 
      // - Top padding: 8px
      // - 4 rows: target input + 3 attribute rows with checkboxes
      // - Each row has input field (~24px with padding) + gap (4px between rows)
      // - Bottom padding: 8px (from starter-jigsaw)
      // Total: 8 + (24 * 4) + (4 * 3) + 8 = 8 + 96 + 12 + 8 = 124px
      return 124
    }
    if (block.type === 'create_mind' || block.type === 'create_mental') {
      // With color picker row added:
      // - Top padding: 8px
      // - 2 rows: variable input + color picker
      // - Each row ~24px + gap 4px
      // - Bottom padding: 8px
      // Total: 8 + (24 * 2) + 4 + 8 = 68px
      return 68
    }
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

    if (!bestTarget) return null
    return { id: (bestTarget as { id: number; side: 'top' | 'bottom'; distance: number }).id, side: (bestTarget as { id: number; side: 'top' | 'bottom'; distance: number }).side }
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="text"
                    value={block.data.variableName}
                    onChange={(e) => updateBlockData(block.id, { variableName: e.target.value })}
                    className="block-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span> = Mind()</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#ccc' }}>color:</span>
                  <input
                    type="color"
                    value={block.data.color}
                    onChange={(e) => updateBlockData(block.id, { color: e.target.value })}
                    className="block-input block-input-color"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="text"
                    value={block.data.variableName}
                    onChange={(e) => updateBlockData(block.id, { variableName: e.target.value })}
                    className="block-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span> = Mental()</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#ccc' }}>color:</span>
                  <input
                    type="color"
                    value={block.data.color}
                    onChange={(e) => updateBlockData(block.id, { color: e.target.value })}
                    className="block-input block-input-color"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
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
              <div className="block-content attribute-content">
                <div className="attribute-row" style={{ marginBottom: '6px' }}>
                  <input
                    type="text"
                    value={block.data.target}
                    onChange={(e) => updateBlockData(block.id, { target: e.target.value })}
                    className="block-input small"
                    onClick={(e) => e.stopPropagation()}
                    placeholder="var"
                  />
                </div>
                <div className="attribute-row">
                  <input
                    type="checkbox"
                    checked={block.data.enableColor}
                    onChange={(e) => updateBlockData(block.id, { enableColor: e.target.checked })}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '14px', height: '14px', marginRight: '4px', cursor: 'pointer' }}
                  />
                  <span style={{ opacity: block.data.enableColor ? 1 : 0.5 }}>.color = </span>
                  <input
                    type="color"
                    value={block.data.color}
                    onChange={(e) => updateBlockData(block.id, { color: e.target.value })}
                    className="block-input block-input-color"
                    onClick={(e) => e.stopPropagation()}
                    disabled={!block.data.enableColor}
                    style={{ opacity: block.data.enableColor ? 1 : 0.5 }}
                  />
                </div>
                <div className="attribute-row">
                  <input
                    type="checkbox"
                    checked={block.data.enableName}
                    onChange={(e) => updateBlockData(block.id, { enableName: e.target.checked })}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '14px', height: '14px', marginRight: '4px', cursor: 'pointer' }}
                  />
                  <span style={{ opacity: block.data.enableName ? 1 : 0.5 }}>.name = </span>
                  <input
                    type="text"
                    value={block.data.name}
                    onChange={(e) => updateBlockData(block.id, { name: e.target.value })}
                    className="block-input"
                    onClick={(e) => e.stopPropagation()}
                    disabled={!block.data.enableName}
                    style={{ opacity: block.data.enableName ? 1 : 0.5 }}
                    placeholder="name"
                  />
                </div>
                <div className="attribute-row">
                  <input
                    type="checkbox"
                    checked={block.data.enableScale}
                    onChange={(e) => updateBlockData(block.id, { enableScale: e.target.checked })}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '14px', height: '14px', marginRight: '4px', cursor: 'pointer' }}
                  />
                  <span style={{ opacity: block.data.enableScale ? 1 : 0.5 }}>.scale = </span>
                  <input
                    type="text"
                    value={block.data.scale}
                    onChange={(e) => updateBlockData(block.id, { scale: e.target.value })}
                    className="block-input"
                    onClick={(e) => e.stopPropagation()}
                    disabled={!block.data.enableScale}
                    style={{ opacity: block.data.enableScale ? 1 : 0.5 }}
                    placeholder="1.0"
                  />
                </div>
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
        <button
          className="examples-button"
          onClick={() => setShowExamples(!showExamples)}
          style={{ 
            marginBottom: '10px',
            background: showExamples ? '#00d4ff' : '#666',
            transition: 'background 0.2s'
          }}
        >
          {showExamples ? '← Back to Blocks' : '💡 Code Examples'}
        </button>
        <button
          className="execute-button"
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('[VisualCodeEditor] Execute button clicked, code:', currentCode)
            onExecute && onExecute(currentCode)
          }}
        >
          Execute
        </button>
      </div>
      
      {showExamples && (
        <div className="examples-panel">
          <h3 style={{ marginBottom: '15px', color: '#00d4ff' }}>Code Examples</h3>
          <div className="examples-grid">
            {CODE_EXAMPLES.map((example) => (
              <div
                key={example.id}
                className="example-card"
                onClick={() => loadExample(example)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'
                  e.currentTarget.style.borderColor = '#00d4ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: example.category === 'basic' ? '#00ff88' : example.category === 'intermediate' ? '#ffc800' : '#ff6b9d',
                    color: '#000',
                    fontWeight: '600'
                  }}>
                    {example.category.toUpperCase()}
                  </span>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{example.title}</h4>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>
                  {example.description}
                </p>
                <pre style={{
                  margin: 0,
                  padding: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#ccc',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {example.code.split('\n').slice(0, 3).join('\n')}
                  {example.code.split('\n').length > 3 ? '\n...' : ''}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
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







