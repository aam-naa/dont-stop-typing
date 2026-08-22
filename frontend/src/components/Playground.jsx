import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { MONACO_THEMES, editorOptions, monacoThemeName } from "../monacoTheme";

const Playground = ({ code: defaultCode, image: referenceImage }) => {
  const [code, setCode] = useState(defaultCode);
  const monaco = useMonaco();
  const theme = useTheme();

  function handleOnChange(value) {
    console.log("value:", value);
    setCode(value || "");
  }

  // Monaco can't read CSS custom properties, so the theme switcher has to
  // retheme it explicitly. Defining all three up front means switching is just
  // setTheme. Presentation only — it does not touch the editor's behaviour.
  useEffect(() => {
    if (!monaco) return;
    for (const [name, definition] of Object.entries(MONACO_THEMES)) {
      monaco.editor.defineTheme(monacoThemeName(name), definition);
    }
    monaco.editor.setTheme(monacoThemeName(theme));
  }, [monaco, theme]);

  return (
    <div className="editor-grid">
      <div className="editor-pane">
        <div className="editor-host">
          <MonacoEditor
            height="100%"
            defaultLanguage="html"
            defaultValue={code.trim()}
            theme={monacoThemeName(theme)}
            options={editorOptions()}
            onChange={handleOnChange}
          />
        </div>
      </div>

      <div className="editor-pane editor-side">
        <figure className="editor-figure">
          <figcaption>reference image</figcaption>
          <div className="canvas">
            <img src={referenceImage} alt="Target" />
          </div>
        </figure>

        <figure className="editor-figure">
          <figcaption>preview</figcaption>
          <div className="canvas">
            <iframe title="preview" srcDoc={code} sandbox="" />
          </div>
        </figure>

        {/* Pinned bottom-right, as the original `absolute bottom-6 right-6` was.
            Still has no onClick — wiring submission is gameplay, not styling. */}
        <div className="actions">
          <button type="button">Submit!</button>
        </div>
      </div>
    </div>
  );
};

export default Playground;
