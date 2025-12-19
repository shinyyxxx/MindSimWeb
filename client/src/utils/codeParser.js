/**
 * Code Parser - Parses visual code blocks into executable actions
 */

export class CodeParser {
  constructor() {
    this.variables = new Map(); // Track variable names and their types
    this.minds = new Map(); // Track mind objects
    this.mentals = new Map(); // Track mental objects
  }

  /**
   * Parse code string into executable actions
   */
  parse(code) {
    this.variables.clear();
    this.minds.clear();
    this.mentals.clear();

    const lines = code.split('\n').filter(line => line.trim());
    const actions = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        // Parse: x = Mind()
        if (trimmed.match(/^\w+\s*=\s*Mind\(\)/)) {
          const match = trimmed.match(/^(\w+)\s*=\s*Mind\(\)/);
          const varName = match[1];
          this.variables.set(varName, { type: 'mind', id: null });
          actions.push({
            type: 'create_mind',
            variable: varName,
            data: { name: 'My Mind', color: '#3cdd8c', scale: 1.5, position: [0, 0, 0], rotation: [0, 0, 0] }
          });
        }
        // Parse: y = Mental()
        else if (trimmed.match(/^\w+\s*=\s*Mental\(\)/)) {
          const match = trimmed.match(/^(\w+)\s*=\s*Mental\(\)/);
          const varName = match[1];
          this.variables.set(varName, { type: 'mental', id: null });
          actions.push({
            type: 'create_mental',
            variable: varName,
            data: { name: 'Mental Sphere', color: '#ff6b9d', scale: 0.1, position: [0, 0, 0] }
          });
        }
        // Parse: x.attribute = value
        else if (trimmed.match(/^\w+\.\w+\s*=\s*.+/)) {
          const match = trimmed.match(/^(\w+)\.(\w+)\s*=\s*(.+)/);
          const varName = match[1];
          const attribute = match[2];
          let value = match[3].trim();

          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }

          const varInfo = this.variables.get(varName);
          if (!varInfo) {
            throw new Error(`Variable ${varName} not found`);
          }

          if (varInfo.type === 'mind') {
            actions.push({
              type: 'update_mind_attribute',
              variable: varName,
              attribute,
              value
            });
          } else if (varInfo.type === 'mental') {
            actions.push({
              type: 'update_mental_attribute',
              variable: varName,
              attribute,
              value
            });
          }
        }
        // Parse: x.add(y)
        else if (trimmed.match(/^\w+\.add\((\w+)\)/)) {
          const match = trimmed.match(/^(\w+)\.add\((\w+)\)/);
          const mindVar = match[1];
          const mentalVar = match[2];

          const mindInfo = this.variables.get(mindVar);
          const mentalInfo = this.variables.get(mentalVar);

          if (!mindInfo || mindInfo.type !== 'mind') {
            throw new Error(`Variable ${mindVar} is not a Mind`);
          }
          if (!mentalInfo || mentalInfo.type !== 'mental') {
            throw new Error(`Variable ${mentalVar} is not a Mental`);
          }

          actions.push({
            type: 'add_mental_to_mind',
            mindVariable: mindVar,
            mentalVariable: mentalVar
          });
        }
      } catch (error) {
        console.error(`Error parsing line: ${trimmed}`, error);
        throw error;
      }
    }

    return actions;
  }

  /**
   * Convert parsed actions to WebSocket messages
   */
  convertToWebSocketMessages(actions) {
    const messages = [];
    const mindIds = new Map(); // Track mind IDs
    const mentalIds = new Map(); // Track mental IDs

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
              rec_status: true
            },
            request_id: `mind_${action.variable}_${Date.now()}`
          });
          // Store variable name for later reference
          mindIds.set(action.variable, null); // Will be updated when response comes
          break;

        case 'update_mind_attribute':
          const mindVar = action.variable;
          // Find the mind ID from previous create action
          // For now, we'll need to track this differently
          messages.push({
            action: 'update_mind',
            data: {
              variable: mindVar,
              attribute: action.attribute,
              value: action.value
            },
            request_id: `update_${mindVar}_${action.attribute}_${Date.now()}`
          });
          break;

        case 'create_mental':
          messages.push({
            action: 'create_mental',
            data: {
              name: action.data.name,
              color: action.data.color,
              scale: action.data.scale,
              position: action.data.position
            },
            request_id: `mental_${action.variable}_${Date.now()}`
          });
          mentalIds.set(action.variable, null);
          break;

        case 'add_mental_to_mind':
          messages.push({
            action: 'append_mental',
            data: {
              mind_variable: action.mindVariable,
              mental_variable: action.mentalVariable
            },
            request_id: `add_${action.mindVariable}_${action.mentalVariable}_${Date.now()}`
          });
          break;
      }
    }

    return messages;
  }
}

