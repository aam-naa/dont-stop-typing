import Editor from '@monaco-editor/react';
import arch from '../assets/arch.png';
import {useState} from 'react';

const Playground = ({ code: defaultCode }) => {
    const [code, setCode] = useState(defaultCode);
  function handleOnChange(value) {
    console.log('value:', value)
    setCode(value || '');
  }

  return (
    <div className="grid grid-cols-2 h-dvh">
        <div className="bg-[#1e1e1e] py-6 h-full min-h-0">
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
      <div className="flex flex-col items-center justify-center gap-20 h-full min-h-0 p-6 overflow-auto">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <p>Reference Image</p>
          <img
            src={arch}
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
      </div>
    </div>
  )
}

export default Playground
