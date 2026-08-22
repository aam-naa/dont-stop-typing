"use client";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Countdown from "react-countdown";
import Shell, { Seg } from "./components/Shell";
import Playground from "./components/Playground";
import { TARGETS } from "./targets.js";

const GAME_DURATION_MS = 5 * 60 * 1000; // 30s

const Editor = () => {
  const [endAt, setEndAt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setEndAt(Date.now() + GAME_DURATION_MS);
  }, []);
  const location = useLocation();
  const target =
    TARGETS.find((t) => t.id === location.state?.picId) ?? TARGETS[0];

  return (
    <Shell
      layout="wide"
      status={
        <>
          <Seg tone="accent">{target.name}</Seg>
          {endAt && (
            /* Wrapped in a span rather than given a `renderer`, so
               react-countdown's own output is untouched and the element is
               purely a CSS hook. */
            <span className="timer">
              <Countdown date={endAt} onComplete={() => navigate("/result")} />
            </span>
          )}
        </>
      }
    >
      <Playground code={target.starter} image={target.image} />
    </Shell>
  );
};

export default Editor;
