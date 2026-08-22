import { useState } from 'react'
import './App.css'
import { useNavigate } from 'react-router'

// testing
function App() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

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
          onClick={() => navigate("/lobby")}
        >
          Start Game
        </button>
      </section>
    </>
  )
}

export default App
