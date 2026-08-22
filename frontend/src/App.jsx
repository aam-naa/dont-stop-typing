import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <span class="blinking-cursor">|</span>
      <section id="center">
        <div>
          <h1>Don't Stop Typing</h1>
          <p>
            A party game for <code>coding</code> enthusiasts - test your <code>css</code>!
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Start Game
        </button>
      </section>
    </>
  )
}

export default App
