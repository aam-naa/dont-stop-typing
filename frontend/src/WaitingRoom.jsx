import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./App.css";
import Countdown from "react-countdown";

// Matches num_players in create_room (backend.py)
const NUM_PLAYERS = 5;

// How long "Starting!" stays on screen after the countdown hits zero.
const START_HOLD_MS = 1500;

const Completionist = () => <span>Starting!</span>;

const WaitingRoom = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const role = Number(searchParams.get("role"));
  const navigate = useNavigate();

  // players[i] will be "connected" | "reserved" | "waiting"
  const [players, setPlayers] = useState({});
  // Deadline for the pre-game countdown; null until the room fills up.
  const [startAt, setStartAt] = useState(null);
  // True once the countdown hits zero, while "Starting!" is still showing.
  const [starting, setStarting] = useState(false);
  const wsRef = useRef(null);
  const renderer = ({ seconds, completed }) => {
    if (completed) {
      return <Completionist />;
    } else {
      return <span>Starting in: {seconds}</span>;
    }
  };

  useEffect(() => {
    const wsUrl =
      import.meta.env.VITE_API_URL.replace(/^http/, "ws") +
      `/ws/${roomId}/${role}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "room_status") {
        setPlayers(data.players); // e.g. { "0": "connected", "1": "waiting", ... }
      }
      if (data.type === "all_connected") {
        console.log(data)
        setStartAt(Date.now() + 5000);
      }
    };

    ws.onclose = (event) => {
      console.log("Websocket closed", event.code, event.reason);
    };

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, role]);

  // Let "Starting!" sit on screen for a beat before leaving the room.
  useEffect(() => {
    if (!starting) return;
    const timer = setTimeout(() => navigate("/editor"), START_HOLD_MS);
    return () => clearTimeout(timer);
  }, [starting, navigate]);

  return (
    <section id="center">
      <h1>Waiting Room</h1>
      <h2>
        Room code: <code>{roomId}</code>
      </h2>

      {startAt && (
        <Countdown
          date={startAt}
          renderer={renderer}
          onComplete={() => setStarting(true)}
        />
      )}

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
