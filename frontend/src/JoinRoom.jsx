import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/image.png'
import './App.css'
import { useNavigate } from 'react-router'

function JoinRoom() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Join Room</h1>
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

export default JoinRoom 
