import { useMemo, useState } from "react";
import { MindWebsiteScene } from "../mindwebsite/MindWebsiteScene";

export function Playground() {
  const [code, setCode] = useState("");

  const lineCount = useMemo(() => code.split("\n").length, [code]);

  return (
    <main className="page">
      <div className="playground">
        <section className="playground-left">
          <div className="playground-header">
            <div>
              <h1 className="playground-title">Playground</h1>
              <p className="playground-subtitle">
                Write turtle commands on the left. The 3D turtle will be rendered on the right.
              </p>
            </div>
            <div className="playground-meta">{lineCount} lines</div>
          </div>

          <textarea
            className="playground-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </section>

        <section className="playground-right">
          <div className="playground-canvas-wrap">
            <div className="playground-canvas">
              <MindWebsiteScene />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


