import { useState, useRef, useEffect } from 'react';
import { StarterJigsaw, AttributeJigsaw, SubComponentJigsaw } from './JigsawBlocks';
import './VisualCodeEditor.css';

/**
 * Visual Code Editor Component
 * Allows users to build code using jigsaw blocks
 */
export function VisualCodeEditor({ onCodeChange, onExecute }) {
  const [blocks, setBlocks] = useState([]);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const editorRef = useRef(null);

  // Available block templates
  const blockTemplates = [
    { type: 'create_mind', label: 'Create Mind', color: '#4C97FF', category: 'mind' },
    { type: 'create_mental', label: 'Create Mental', color: '#FF8C1A', category: 'mental' },
    { type: 'set_attribute', label: 'Set Attribute', color: '#9966FF', category: 'attribute' },
    { type: 'add_mental', label: 'Add Mental', color: '#59C059', category: 'action' },
  ];

  const handleDragStart = (e, template) => {
    setDraggedBlock(template);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const rect = editorRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBlock = {
      id: Date.now() + Math.random(),
      type: draggedBlock.type,
      label: draggedBlock.label,
      color: draggedBlock.color,
      x,
      y,
      data: getDefaultDataForType(draggedBlock.type),
    };

    setBlocks([...blocks, newBlock]);
    setDraggedBlock(null);
    generateCode();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const getDefaultDataForType = (type) => {
    switch (type) {
      case 'create_mind':
        return { variableName: 'x', name: 'My Mind', color: '#3cdd8c', scale: 1.5 };
      case 'create_mental':
        return { variableName: 'y', name: 'Mental Sphere', color: '#ff6b9d', scale: 0.1 };
      case 'set_attribute':
        return { target: 'x', attribute: 'color', value: '#fe0000' };
      case 'add_mental':
        return { mindVar: 'x', mentalVar: 'y' };
      default:
        return {};
    }
  };

  const updateBlockData = (blockId, newData) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, data: { ...block.data, ...newData } } : block
    ));
    generateCode();
  };

  const deleteBlock = (blockId) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    generateCode();
  };

  const generateCode = () => {
    let code = '';
    const variableMap = new Map();

    blocks.forEach(block => {
      switch (block.type) {
        case 'create_mind':
          code += `${block.data.variableName} = Mind()\n`;
          variableMap.set(block.data.variableName, { type: 'mind', id: block.id });
          if (block.data.name !== 'My Mind') {
            code += `${block.data.variableName}.name = "${block.data.name}"\n`;
          }
          if (block.data.color !== '#3cdd8c') {
            code += `${block.data.variableName}.color = "${block.data.color}"\n`;
          }
          if (block.data.scale !== 1.5) {
            code += `${block.data.variableName}.scale = ${block.data.scale}\n`;
          }
          break;
        case 'create_mental':
          code += `${block.data.variableName} = Mental()\n`;
          variableMap.set(block.data.variableName, { type: 'mental', id: block.id });
          if (block.data.name !== 'Mental Sphere') {
            code += `${block.data.variableName}.name = "${block.data.name}"\n`;
          }
          if (block.data.color !== '#ff6b9d') {
            code += `${block.data.variableName}.color = "${block.data.color}"\n`;
          }
          if (block.data.scale !== 0.1) {
            code += `${block.data.variableName}.scale = ${block.data.scale}\n`;
          }
          break;
        case 'set_attribute':
          code += `${block.data.target}.${block.data.attribute} = ${formatValue(block.data.value)}\n`;
          break;
        case 'add_mental':
          code += `${block.data.mindVar}.add(${block.data.mentalVar})\n`;
          break;
      }
    });

    if (onCodeChange) {
      onCodeChange(code);
    }
    return code;
  };

  const formatValue = (value) => {
    if (typeof value === 'string') {
      if (value.startsWith('#')) {
        return `"${value}"`;
      }
      return `"${value}"`;
    }
    return value;
  };

  const renderBlock = (block) => {
    const isSelected = selectedBlock?.id === block.id;

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
            <button className="block-delete" onClick={() => deleteBlock(block.id)}>×</button>
          </div>
        );
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
            <button className="block-delete" onClick={() => deleteBlock(block.id)}>×</button>
          </div>
        );
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
            <button className="block-delete" onClick={() => deleteBlock(block.id)}>×</button>
          </div>
        );
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
            <button className="block-delete" onClick={() => deleteBlock(block.id)}>×</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="visual-code-editor">
      <div className="block-palette">
        <h3>Blocks</h3>
        <div className="block-templates">
          {blockTemplates.map(template => (
            <div
              key={template.type}
              className="block-template"
              draggable
              onDragStart={(e) => handleDragStart(e, template)}
              style={{ '--template-color': template.color }}
            >
              {template.label}
            </div>
          ))}
        </div>
        <button className="execute-button" onClick={() => onExecute && onExecute(generateCode())}>
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
        {blocks.length === 0 && (
          <div className="empty-editor">
            Drag blocks here to build your code
          </div>
        )}
        {blocks.map(renderBlock)}
      </div>
    </div>
  );
}

