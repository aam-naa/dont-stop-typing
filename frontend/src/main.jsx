import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Lobby from './Lobby.jsx'
import Editor from './Editor.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WaitingRoom from './WaitingRoom.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>} />
        <Route path="/lobby" element={<Lobby/>} />
        <Route path ="/editor" element={<Editor/>} />
        <Route path="/waiting_room" element={<WaitingRoom />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
