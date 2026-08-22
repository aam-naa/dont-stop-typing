import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./App.css";
import Countdown from "react-countdown";

// Matches num_players in create_room (backend.py)
const NUM_PLAYERS = 5;

const WaitingRoom = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const role = Number(searchParams.get("role"));
  const navigate = useNavigate();

  // players[i] will be "connected" | "reserved" | "waiting"
  const [players, setPlayers] = useState({});
  const wsRef = useRef(null);
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      navigate("/editor");
    } else {
      return (
        <span>
          {seconds}
        </span>
      );
    }
  };

  useEffect(() => {
    const wsUrl =
      import.meta.env.VITE_API_URL.replace(/^http/, "ws") +
      `/ws/${roomId}/${role}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    let timer;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "room_status") {
        setPlayers(data.players); // e.g. { "0": "connected", "1": "waiting", ... }
      }
      if (data.type === "all_connected") {
        <Countdown date={Date.now() + 5000} renderer={renderer} />;
      }
    };

    ws.onclose = (event) => {
      console.log("Websocket closed", event.code, event.reason);
    };

    return () => {
      clearTimeout(timer);
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, role]);
  return (
    <section id="center">
      <h1>Waiting Room</h1>
      <h2>
        Room code: <code>{roomId}</code>
      </h2>

      <ul className="player-grid">
        {Array.from({ length: NUM_PLAYERS }, (_, i) => {
          console.log(players);
          const status = players[String(i)] ?? "waiting";
          const isConnected = status === "connected";
          const isReserved = status === "reserved";
          return (
            <li
              key={i}
              className={`player-slot${i === role ? " is-you" : ""}${isConnected ? " is-connected" : ""}${isReserved ? " is-reserved" : ""}`}
            >
              <span className="player-number">{i + 1}</span>
              <span className="player-label">
                {i === role
                  ? "You"
                  : isConnected
                    ? "Connected"
                    : isReserved
                      ? "Reserved"
                      : "Waiting…"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default WaitingRoom;
