import { useState, useEffect, useRef } from "react";
import { MindWebsiteScene } from "../mindwebsite/MindWebsiteScene";
import { VisualCodeEditor } from "../components/VisualCodeEditor";
import { CodeParser } from "../utils/codeParser";
import { WebSocketClient } from "../utils/websocketClient";

export function Playground() {
  const [code, setCode] = useState("");
  const [wsClient, setWsClient] = useState(null);
  const [minds, setMinds] = useState([]);
  const [mentals, setMentals] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const wsClientRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket client
    const client = new WebSocketClient(
      import.meta.env.VITE_WS_URL || "ws://localhost:8000",
      `user_${Math.floor(Math.random() * 10000)}`
    );

    client.on("connected", () => {
      setConnectionStatus("connected");
      console.log("WebSocket connected");
    });

    client.on("disconnected", () => {
      setConnectionStatus("disconnected");
      console.log("WebSocket disconnected");
    });

    client.on("message", (data) => {
      console.log("WebSocket message received:", data);
      handleWebSocketMessage(data);
    });

    client.on("error", (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
    });

    client.connect().catch(console.error);
    wsClientRef.current = client;
    setWsClient(client);

    return () => {
      client.disconnect();
    };
  }, []);

  const handleWebSocketMessage = (data) => {
    if (data.type === "response" && data.status === "success") {
      if (data.action === "upsert_mind" && data.data?.mind) {
        const mind = data.data.mind;
        const variable = pendingMindsRef.current.get(data.request_id);
        
        // Track variable to ID mapping
        if (variable) {
          variableToIdRef.current.set(variable, { type: "mind", id: mind.id });
          pendingMindsRef.current.delete(data.request_id);
        }
        
        setMinds(prev => {
          const existing = prev.find(m => m.id === mind.id);
          const updatedMind = { ...mind, variable };
          if (existing) {
            return prev.map(m => m.id === mind.id ? updatedMind : m);
          }
          return [...prev, updatedMind];
        });
      } else if (data.action === "append_mental" && data.data) {
        // Update mind with new mental sphere IDs
        const mindId = data.data.mind_id;
        const mentalIds = data.data.mental_sphere_ids || [];
        setMinds(prev => prev.map(m => 
          m.id === mindId 
            ? { ...m, mental_sphere_ids: mentalIds }
            : m
        ));
      }
    } else if (data.type === "update") {
      // Handle real-time updates
      if (data.action === "mind_updated" && data.data) {
        const mind = data.data;
        setMinds(prev => {
          const existing = prev.find(m => m.id === mind.id);
          if (existing) {
            return prev.map(m => m.id === mind.id ? { ...mind, variable: m.variable } : m);
          }
          return [...prev, mind];
        });
      }
    } else if (data.type === "preview") {
      // Handle preview updates (optimistic UI)
      if (data.action === "upsert_mind" && data.data?.mind) {
        const mind = data.data.mind;
        const variable = pendingMindsRef.current.get(data.request_id);
        const previewMind = { ...mind, variable, _preview: true };
        
        setMinds(prev => {
          const existing = prev.find(m => m._preview && m.id === mind.id);
          if (existing) {
            return prev.map(m => m._preview && m.id === mind.id ? previewMind : m);
          }
          return [...prev, previewMind];
        });
      }
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const variableToIdRef = useRef(new Map());
  const pendingMindsRef = useRef(new Map()); // Track pending mind creations

  const handleExecute = (codeToExecute) => {
    if (!wsClient || !wsClient.connected) {
      alert("WebSocket not connected. Please wait...");
      return;
    }

    try {
      const parser = new CodeParser();
      const actions = parser.parse(codeToExecute);
      
      // Reset tracking
      variableToIdRef.current.clear();
      pendingMindsRef.current.clear();

      // Execute actions sequentially
      actions.forEach((action, index) => {
        setTimeout(() => {
          switch (action.type) {
            case "create_mind":
              const requestId = `mind_${action.variable}_${Date.now()}_${index}`;
              pendingMindsRef.current.set(requestId, action.variable);
              
              wsClient.send({
                action: "upsert_mind",
                data: {
                  name: action.data.name || "My Mind",
                  detail: "",
                  color: action.data.color || "#3cdd8c",
                  position: action.data.position || [0, 0, 0],
                  rotation: action.data.rotation || [0, 0, 0],
                  scale: action.data.scale || 1.5,
                  rec_status: true
                },
                request_id: requestId
              });
              break;

            case "update_mind_attribute":
              // Find the mind by variable name
              const mindVarInfo = variableToIdRef.current.get(action.variable);
              const mind = minds.find(m => 
                m.variable === action.variable || 
                (mindVarInfo && mindVarInfo.id === m.id)
              );
              
              if (mind) {
                // Update the mind with new attribute
                const updatedMind = { ...mind };
                if (action.attribute === 'color') {
                  updatedMind.color = action.value;
                } else if (action.attribute === 'name') {
                  updatedMind.name = action.value;
                } else if (action.attribute === 'scale') {
                  updatedMind.scale = parseFloat(action.value) || updatedMind.scale;
                }
                
                wsClient.send({
                  action: "upsert_mind",
                  data: {
                    id: mind.id,
                    name: updatedMind.name,
                    detail: mind.detail || "",
                    color: updatedMind.color,
                    position: mind.position || [0, 0, 0],
                    rotation: mind.rotation || [0, 0, 0],
                    scale: updatedMind.scale,
                    rec_status: true
                  },
                  request_id: `update_${action.variable}_${action.attribute}_${Date.now()}`
                });
              } else {
                console.warn(`Mind with variable ${action.variable} not found yet. Waiting for creation...`);
                // Store the update to apply later
                setTimeout(() => {
                  const retryMind = minds.find(m => 
                    m.variable === action.variable || 
                    (mindVarInfo && mindVarInfo.id === m.id)
                  );
                  if (retryMind) {
                    handleExecute(codeToExecute); // Retry execution
                  }
                }, 500);
              }
              break;

            case "create_mental":
              const mentalId = Date.now();
              variableToIdRef.current.set(action.variable, { type: "mental", id: mentalId });
              
              // Create mental sphere (client-side for now)
              const mental = {
                id: mentalId,
                name: action.data.name || "Mental Sphere",
                color: action.data.color || "#ff6b9d",
                scale: action.data.scale || 0.1,
                position: action.data.position || [0.3, 0.2, 0.1],
                variable: action.variable
              };
              setMentals(prev => {
                const existing = prev.find(m => m.variable === action.variable);
                if (existing) {
                  return prev.map(m => m.variable === action.variable ? mental : m);
                }
                return [...prev, mental];
              });
              break;

            case "add_mental_to_mind":
              const mindVar = action.mindVariable;
              const mentalVar = action.mentalVariable;
              
              // Find the mind and mental
              const targetMind = minds.find(m => 
                m.variable === mindVar || 
                variableToIdRef.current.get(mindVar)?.id === m.id
              );
              const targetMental = mentals.find(m => 
                m.variable === mentalVar || 
                m.id === variableToIdRef.current.get(mentalVar)?.id
              );
              
              if (targetMind && targetMental) {
                wsClient.send({
                  action: "append_mental",
                  data: {
                    mind_id: targetMind.id,
                    sphere_id: [targetMental.id]
                  },
                  request_id: `add_${mindVar}_${mentalVar}_${Date.now()}`
                });
              } else {
                console.warn(`Mind ${mindVar} or Mental ${mentalVar} not found`);
              }
              break;
          }
        }, index * 200); // Stagger requests
      });
    } catch (error) {
      console.error("Error executing code:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <main className="page">
      <div className="playground">
        <section className="playground-left">
          <div className="playground-header">
            <div>
              <h1 className="playground-title">Playground</h1>
              <p className="playground-subtitle">
                Build your code using visual blocks. The 3D scene will update in real-time.
              </p>
            </div>
            <div className="playground-meta">
              <span style={{ 
                color: connectionStatus === "connected" ? "#10b981" : "#ef4444",
                fontSize: "10px",
                marginRight: "8px"
              }}>
                ●
              </span>
              {connectionStatus}
            </div>
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <VisualCodeEditor
              onCodeChange={handleCodeChange}
              onExecute={handleExecute}
            />
          </div>
        </section>

        <section className="playground-right">
          <div className="playground-canvas-wrap">
            <div className="playground-canvas">
              <MindWebsiteScene minds={minds} mentals={mentals} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


