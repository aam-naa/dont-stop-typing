import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// The one and only stylesheet import in the app. Everything else is @imported
// from there, so the cascade order lives in exactly one place.
import "./styles/index.css";

import App from "./App.jsx";
import Lobby from "./Lobby.jsx";
import Editor from "./Editor.jsx";
import WaitingRoom from "./WaitingRoom.jsx";
import ResultPage from "./ResultPage.jsx";
import LeaderBoard from "./LeaderBoard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>} />
        <Route path="/lobby" element={<Lobby/>} />
        <Route path ="/editor/:roomId/:role" element={<Editor/>} />
        <Route path="/room/:roomId" element={<WaitingRoom/>} />
        <Route path="/result" element={<ResultPage />} />
        {/* was path="leaderboard" — relative, so it was unreachable from root */}
        <Route path="/leaderboard" element={<LeaderBoard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
