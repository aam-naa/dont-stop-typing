import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Lobby from './Lobby.jsx'
import CreateRoom from './CreateRoom.jsx'
import JoinRoom from './JoinRoom.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>} />
        <Route path="/lobby" element={<Lobby/>} />
        <Route path="/create_room" element={<CreateRoom/>} />
        <Route path="/join_room" element={<JoinRoom/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
