import Editor from '@monaco-editor/react';
import {useState} from 'react';
import { useNavigate } from "react-router";

const Playground = ({ code: defaultCode, image: referenceImage }) => {
    const [code, setCode] = useState(defaultCode);
      const navigate = useNavigate();
  function handleOnChange(value) {
    console.log('value:', value)
    setCode(value || '');
  }

  return (
    <div className="grid grid-cols-2 h-dvh">
        <div className="flex flex-col bg-[#1e1e1e] py-6 h-full min-h-0">
            <div className="flex-1 min-h-0">
              <Editor
                defaultLanguage="html"
                defaultValue={code.trim()}
                theme="vs-dark"
                options={{
                fontSize: 14,
                minimap: { enabled: false },
                contextmenu: false
                }}
                onChange={handleOnChange}
              />
            </div>
      </div>
      <div className="relative flex flex-col items-center justify-center gap-10 h-full min-h-0 p-6 overflow-hidden">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <p>Reference Image</p>
          <img
            src={referenceImage}
            alt="Target"
            className="size-[300px]"
          />
        </div>
        <div className="flex flex-col gap-2 size-[300px] shrink-0 overflow-hidden">
            <p>Preview</p>
            <iframe
            title="preview"
            srcDoc={code}
            sandbox=""
            className="w-full h-full border-0"
          />
        </div>
        <button type="button" className="absolute bottom-6 right-6 z-10" >
          Submit!
        </button>
      </div>
    </div>
  )
}

export default Playground
