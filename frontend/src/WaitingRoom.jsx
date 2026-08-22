import React from 'react'
import {useParams, useSearchParams} from 'react-router-dom'
import './App.css'

// Matches num_players in create_room (backend.py)
const NUM_PLAYERS = 5

const WaitingRoom = () => {
  const {roomId} = useParams()
  const [searchParams] = useSearchParams()
  const role = Number(searchParams.get("role"))

  return (
    <section id="center">
      <h1>Waiting Room</h1>
      <h2>Room code: <code>{roomId}</code></h2>

      <ul className="player-grid">

        {Array.from({ length: NUM_PLAYERS }, (_, i) => {
          const status = players[String(i)] ?? "waiting"
          const isConnected = status === "connected"
          return (
            <li
              key={i}
              className={`player-slot${i === role ? " is-you" : ""}${isConnected ? " is-connected" : ""}`}
            >
              <span className="player-number">{i + 1}</span>
              <span className="player-label">
                {i === role ? "You" : isConnected ? "Connected" : "Waiting…"}
              </span>
            </li>
          )
        })}

      </ul>
    </section>
  )
}

export default WaitingRoom
