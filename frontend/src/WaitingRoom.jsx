import React from 'react'
import {useParams} from 'react-router-dom'

const WaitingRoom = () => {
  const {roomId} = useParams()

  return (
    <div>
      <h1>Waiting Room</h1>
      <p> Room code: {roomId}</p>
      </div>
  )
}

export default WaitingRoom