import React from 'react'
import {useParams, useSearchParams} from 'react-router-dom'

const WaitingRoom = () => {
  const {roomId} = useParams()
  const [searchParams] = useSearchParams()
  const role = Number(searchParams.get("role"))

  return (
    <div>
      <h1>Waiting Room</h1>
      <p> Room code: {roomId}</p>
      <p> You are player {role + 1}</p>
      </div>
  )
}

export default WaitingRoom