/**
 * Code Parser - Parses visual code blocks into executable actions
 */

export type Vec3 = [number, number, number]

export type ParsedAction =
  | {
      type: 'create_mind'
      variable: string
      data: {
        name: string
        color: string
        scale: number
        position: Vec3
        rotation: Vec3
      }
    }
  | {
      type: 'create_mental'
      variable: string
      data: {
        name: string
        color: string
        scale: number
        position: Vec3
      }
    }
  | {
      type: 'update_mind_attribute'
      variable: string
      attribute: string
      value: string
    }
  | {
      type: 'update_mental_attribute'
      variable: string
      attribute: string
      value: string
    }
  | {
      type: 'add_mental_to_mind'
      mindVariable: string
      mentalVariable: string
    }

type VarType = 'mind' | 'mental'
type VarInfo = { type: VarType; id: number | null }

export class CodeParser {
  private variables = new Map<string, VarInfo>()
  private minds = new Map<string, unknown>()
  private mentals = new Map<string, unknown>()

  /**
   * Parse code string into executable actions
   */
  parse(code: string): ParsedAction[] {
    this.variables.clear()
    this.minds.clear()
    this.mentals.clear()

    const lines = code.split('\n')

    const actions: ParsedAction[] = []

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const lineNo = lineIndex + 1
      const trimmed = lines[lineIndex].trim()
      if (trimmed.length === 0) continue
      try {
        // Parse: x = Mind()
        if (/^\w+\s*=\s*Mind\(\)/.test(trimmed)) {
          const match = trimmed.match(/^(\w+)\s*=\s*Mind\(\)/)
          if (!match) continue
          const varName = match[1]
          if (this.variables.has(varName)) {
            throw new Error(`Line ${lineNo}: variable "${varName}" is already declared`)
          }
          this.variables.set(varName, { type: 'mind', id: null })
          actions.push({
            type: 'create_mind',
            variable: varName,
            data: {
              name: 'My Mind',
              color: '#ffffff',
              scale: 1.5,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
            },
          })
        }
        // Parse: y = Mental() or y = SomeMental()
        else if (/^\w+\s*=\s*\w+\(\)/.test(trimmed)) {
          const match = trimmed.match(/^(\w+)\s*=\s*(\w+)\(\)/)
          if (!match) continue
          const varName = match[1]
          const className = match[2]
          const isMentalCtor = className === 'Mental' || className.endsWith('Mental')
          if (!isMentalCtor) continue
          const constructorNameAliases: Record<string, string> = {
            DeterminationMental: 'Decision',
          }
          if (this.variables.has(varName)) {
            throw new Error(`Line ${lineNo}: variable "${varName}" is already declared`)
          }
          const inferredName =
            className === 'Mental'
              ? 'Mental Sphere'
              : constructorNameAliases[className] ?? (
                className
                  .replace(/Mental$/, '')
                  .replace(/([a-z])([A-Z])/g, '$1 $2')
                  .trim() || 'Mental Sphere'
              )
          this.variables.set(varName, { type: 'mental', id: null })
          actions.push({
            type: 'create_mental',
            variable: varName,
            data: { name: inferredName, color: '#ff6b9d', scale: 0.1, position: [0, 0, 0] },
          })
        }
        // Parse: x.attribute = value
        else if (/^\w+\.\w+\s*=\s*.+/.test(trimmed)) {
          const match = trimmed.match(/^(\w+)\.(\w+)\s*=\s*(.+)/)
          if (!match) continue
          const varName = match[1]
          const attribute = match[2]
          let value = match[3].trim()

          // Remove quotes if present
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1)
          }

          const varInfo = this.variables.get(varName)
          if (!varInfo) {
            throw new Error(`Line ${lineNo}: variable "${varName}" not found`)
          }

          if (varInfo.type === 'mind') {
            actions.push({
              type: 'update_mind_attribute',
              variable: varName,
              attribute,
              value,
            })
          } else if (varInfo.type === 'mental') {
            actions.push({
              type: 'update_mental_attribute',
              variable: varName,
              attribute,
              value,
            })
          }
        }
        // Parse: x.add(y)
        else if (/^\w+\.add\((\w+)\)/.test(trimmed)) {
          const match = trimmed.match(/^(\w+)\.add\((\w+)\)/)
          if (!match) continue
          const mindVar = match[1]
          const mentalVar = match[2]

          const mindInfo = this.variables.get(mindVar)
          const mentalInfo = this.variables.get(mentalVar)

          if (!mindInfo || mindInfo.type !== 'mind') {
            throw new Error(`Line ${lineNo}: variable "${mindVar}" is not a Mind`)
          }
          if (!mentalInfo || mentalInfo.type !== 'mental') {
            throw new Error(`Line ${lineNo}: variable "${mentalVar}" is not a Mental`)
          }

          actions.push({
            type: 'add_mental_to_mind',
            mindVariable: mindVar,
            mentalVariable: mentalVar,
          })
        }
      } catch (error) {
        if (error instanceof Error) throw error
        throw new Error(`Line ${lineNo}: parse error`)
      }
    }

    return actions
  }

  /**
   * Convert parsed actions to WebSocket messages
   */
  convertToWebSocketMessages(actions: ParsedAction[]): unknown[] {
    const messages: unknown[] = []

    for (const action of actions) {
      switch (action.type) {
        case 'create_mind':
          messages.push({
            action: 'upsert_mind',
            data: {
              name: action.data.name,
              detail: '',
              color: action.data.color,
              position: action.data.position,
              rotation: action.data.rotation,
              scale: action.data.scale,
              rec_status: true,
            },
            request_id: `mind_${action.variable}_${Date.now()}`,
          })
          break

        case 'update_mind_attribute':
          messages.push({
            action: 'update_mind',
            data: {
              variable: action.variable,
              attribute: action.attribute,
              value: action.value,
            },
            request_id: `update_${action.variable}_${action.attribute}_${Date.now()}`,
          })
          break

        case 'create_mental':
          messages.push({
            action: 'create_mental',
            data: {
              name: action.data.name,
              color: action.data.color,
              scale: action.data.scale,
              position: action.data.position,
            },
            request_id: `mental_${action.variable}_${Date.now()}`,
          })
          break

        case 'add_mental_to_mind':
          messages.push({
            action: 'append_mental',
            data: {
              mind_variable: action.mindVariable,
              mental_variable: action.mentalVariable,
            },
            request_id: `add_${action.mindVariable}_${action.mentalVariable}_${Date.now()}`,
          })
          break
      }
    }

    return messages
  }
}







