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

    const lines = code
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    const actions: ParsedAction[] = []

    for (const trimmed of lines) {
      try {
        // Parse: x = Mind()
        if (/^\w+\s*=\s*Mind\(\)/.test(trimmed)) {
          const match = trimmed.match(/^(\w+)\s*=\s*Mind\(\)/)
          if (!match) continue
          const varName = match[1]
          this.variables.set(varName, { type: 'mind', id: null })
          actions.push({
            type: 'create_mind',
            variable: varName,
            data: {
              name: 'My Mind',
              color: '#3cdd8c',
              scale: 1.5,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
            },
          })
        }
        // Parse: y = Mental()
        else if (/^\w+\s*=\s*Mental\(\)/.test(trimmed)) {
          const match = trimmed.match(/^(\w+)\s*=\s*Mental\(\)/)
          if (!match) continue
          const varName = match[1]
          this.variables.set(varName, { type: 'mental', id: null })
          actions.push({
            type: 'create_mental',
            variable: varName,
            data: { name: 'Mental Sphere', color: '#ff6b9d', scale: 0.1, position: [0, 0, 0] },
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
            throw new Error(`Variable ${varName} not found`)
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
            throw new Error(`Variable ${mindVar} is not a Mind`)
          }
          if (!mentalInfo || mentalInfo.type !== 'mental') {
            throw new Error(`Variable ${mentalVar} is not a Mental`)
          }

          actions.push({
            type: 'add_mental_to_mind',
            mindVariable: mindVar,
            mentalVariable: mentalVar,
          })
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error parsing line: ${trimmed}`, error)
        throw error
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







