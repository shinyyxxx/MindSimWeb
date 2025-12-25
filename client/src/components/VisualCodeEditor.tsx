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
    }
  | {
      id: number
      type: 'create_mental'
      label: string
      color: string
      x: number
      y: number
      data: CreateMentalData
    }
  | {
      id: number
      type: 'set_attribute'
      label: string
      color: string
      x: number
      y: number
      data: SetAttributeData
    }
  | {
      id: number
      type: 'add_mental'
      label: string
      color: string
      x: number
      y: number
      data: AddMentalData
    }

export interface VisualCodeEditorProps {
  onCodeChange?: (code: string) => void
  onExecute?: (code: string) => void
}

function getDefaultDataForType(type: BlockType): BlockData {
  switch (type) {
    case 'create_mind':
      return { variableName: 'x', name: 'My Mind', color: '#3cdd8c', scale: 1.5 }
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

  blocks.forEach((block) => {
    switch (block.type) {
      case 'create_mind':
        code += `${block.data.variableName} = Mind()\n`
        if (block.data.name !== 'My Mind') {
          code += `${block.data.variableName}.name = "${block.data.name}"\n`
        }
        if (block.data.color !== '#3cdd8c') {
          code += `${block.data.variableName}.color = "${block.data.color}"\n`
        }
        if (block.data.scale !== 1.5) {
          code += `${block.data.variableName}.scale = ${block.data.scale}\n`
        }
        break
      case 'create_mental':
        code += `${block.data.variableName} = Mental()\n`
        if (block.data.name !== 'Mental Sphere') {
          code += `${block.data.variableName}.name = "${block.data.name}"\n`
        }
        if (block.data.color !== '#ff6b9d') {
          code += `${block.data.variableName}.color = "${block.data.color}"\n`
        }
        if (block.data.scale !== 0.1) {
          code += `${block.data.variableName}.scale = ${block.data.scale}\n`
        }
        break
      case 'set_attribute':
        code += `${block.data.target}.${block.data.attribute} = ${formatValue(block.data.value)}\n`
        break
      case 'add_mental':
        code += `${block.data.mindVar}.add(${block.data.mentalVar})\n`
        break
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
  const editorRef = useRef<HTMLDivElement | null>(null)

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
      const next = prev.filter((block) => block.id !== blockId)
      emitCodeChange(next)
      return next
    })
  }

  const renderBlock = (block: Block) => {
    const isSelected = selectedBlock?.id === block.id

    switch (block.type) {
      case 'create_mind':
        return (
          <div
            key={block.id}
            className={`code-block ${isSelected ? 'selected' : ''}`}
            style={{ left: block.x, top: block.y }}
            onClick={() => setSelectedBlock(block)}
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
            className={`code-block ${isSelected ? 'selected' : ''}`}
            style={{ left: block.x, top: block.y }}
            onClick={() => setSelectedBlock(block)}
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
            className={`code-block ${isSelected ? 'selected' : ''}`}
            style={{ left: block.x, top: block.y }}
            onClick={() => setSelectedBlock(block)}
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
            className={`code-block ${isSelected ? 'selected' : ''}`}
            style={{ left: block.x, top: block.y }}
            onClick={() => setSelectedBlock(block)}
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







