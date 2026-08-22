import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/image.png'
import './App.css'
import { useNavigate } from 'react-router'

function Lobby() {
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
          <h1>Create or Join a Room</h1>
          <p>
            A party game for <code>coding</code> enthusiasts - test your <code>css</code>!
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/create_room")}
        >
          Create Room 
        </button>
        <button
          type="button"
          onClick={() => navigate("/join_room")}
        >
          Join Room 
        </button>

      </section>

      <section id="spacer"></section>
    </>
  )
}

export default Lobby 
