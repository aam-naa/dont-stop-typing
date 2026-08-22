import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Countdown from "react-countdown";
import Shell, { Seg } from "./components/Shell";

// Matches num_players in create_room (backend.py)
const NUM_PLAYERS = 5;

// How long "Starting!" stays on screen after the countdown hits zero.
const START_HOLD_MS = 1500;

const Completionist = () => <span className="starting">Starting!</span>;

// Presentation only: a glyph per state so the slots and rows don't rely on
// colour alone.
const GLYPH = { connected: "●", reserved: "◐", waiting: "○" };

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
  const [picId, setPicId] = useState(null);

  const wsRef = useRef(null);
  const renderer = ({ seconds, completed }) => {
    if (completed) {
      return <Completionist />;
    } else {
      return <span className="starting">Starting in: {seconds}</span>;
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
        console.log("hello i am under the water")
        console.log(data)
        setPicId(data.pic_id)
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
    const timer = setTimeout(() => navigate("/editor", {state: {picId}}), START_HOLD_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starting, navigate]);

  const slots = Array.from({ length: NUM_PLAYERS }, (_, i) => i);
  const stateOf = (i) => players[String(i)] ?? "waiting";
  const connected = slots.filter((i) => stateOf(i) === "connected").length;

  return (
    <Shell
      layout="column"
      status={
        <>
          <Seg>room {roomId}</Seg>
          <Seg tone={connected === NUM_PLAYERS ? "ok" : undefined}>
            {connected}/{NUM_PLAYERS} connected
          </Seg>
        </>
      }
    >
      <div className="col">
        <h2 className="rule">room</h2>

        <dl className="room-meta">
          <dt>code</dt>
          <dd>
            <span className="room-code">{roomId}</span>
          </dd>
          <dt>slots</dt>
          <dd>
            <span
              className="slots"
              role="img"
              aria-label={`${connected} of ${NUM_PLAYERS} players connected`}
            >
              <span aria-hidden="true">[</span>
              {slots.map((i) => (
                <span
                  key={i}
                  className="slot"
                  data-state={i === role ? "you" : stateOf(i)}
                />
              ))}
              <span aria-hidden="true">]</span>
            </span>
          </dd>
        </dl>

        <h2 className="rule">players</h2>
        <ul className="players">
          {slots.map((i) => {
            const status = stateOf(i);
            const isConnected = status === "connected";
            const isReserved = status === "reserved";
            return (
              <li key={i} className="prow" data-you={i === role}>
                <span className="prow-marker" aria-hidden="true" />
                <span>{i + 1}</span>
                <span className="prow-glyph" data-state={status} aria-hidden="true">
                  {GLYPH[status]}
                </span>
                <span className="prow-state">
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

        {startAt && (
          <Countdown
            date={startAt}
            renderer={renderer}
            onComplete={() => setStarting(true)}
          />
        )}
      </div>
    </Shell>
  );
};

export default WaitingRoom;
