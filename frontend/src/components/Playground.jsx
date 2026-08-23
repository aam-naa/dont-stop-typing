import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "../hooks/useTheme";
import { MONACO_THEMES, editorOptions, monacoThemeName } from "../monacoTheme";

const JOKES = 
    [
        "you're a quick one, aren't ya?", 
        "you shouldn't click things without permission you know...", 
        "no way you finished this quickly...", 
        "did you really think this button would work?",
        "YOU JUST DETONATED A BOMB!!!! (jk :P)",
        "access denied, didn't like your pic",
        "maybe press it one more time..."
    ];

const isImageUrl = (value) =>
  typeof value === "string" && /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(value);

const Playground = ({ code: defaultCode, image: referenceImage, onChange }) => {
  const [code, setCode] = useState(defaultCode);
  const navigate = useNavigate();
  // Both hooks feed the theming effect below; without these calls `monaco` and
  // `theme` are undefined and the component throws on render.
  const monaco = useMonaco();
  const theme = useTheme();
  const editorRef = useRef(null);
  const [joke, setJoke] = useState("")

  function handleClick() {
    const random = JOKES[Math.floor(Math.random() * JOKES.length)];
    setJoke(random);
  }


  function handleOnChange(value) {
    console.log('value:', value)
    const newCode = value || '';
    setCode(newCode);
    onChange?.(newCode); // tell the parent about the edit
  }

  useEffect(() => {
    const next = defaultCode ?? "";
    setCode(next);
    const editor = editorRef.current;
    if (editor && editor.getValue() !== next) {
      editor.setValue(next);
    }
  }, [defaultCode]);

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
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            onChange={handleOnChange}
          />
        </div>
      </div>

      <div className="editor-pane editor-side">
        <figure className="editor-figure">
          <figcaption>reference image</figcaption>
          <div className="canvas">
            {isImageUrl(referenceImage) ? (
              <img src={referenceImage} alt="Target" />
            ) : (
              <iframe
                title="reference"
                srcDoc={referenceImage ?? ""}
                sandbox=""
              />
            )}
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
        <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button">Submit!</button>
            {joke && <span>{joke}</span>}
        </div>
      </div>
    </div>
  );
};

export default Playground;
