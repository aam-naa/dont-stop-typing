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
      <div className="flex flex-col gap-6 w-full max-w-3xl m-auto h-full min-h-0 p-6">
        <img src={arch} className="flex-1 min-h-0 w-full object-contain" />
        <div className="flex-1 min-h-0 w-full overflow-hidden bg-white">
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
