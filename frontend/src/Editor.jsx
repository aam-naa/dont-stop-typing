"use client";
import { useEffect, useState } from 'react';
import Playground from './components/Playground';
import { useNavigate } from 'react-router-dom';
import Countdown from 'react-countdown'
import {useLocation} from 'react-router-dom';
import {TARGETS} from './targets.js';

const GAME_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const INTERVAL_MS = 6 * 1000; // 6 seconds 
const MAX_CALLS = 5;

const renderer = ({ minutes, seconds }) => (
  <span>{minutes}:{String(seconds).padStart(2, '0')}</span>
);

const Editor = () => {
  const [endAt, setEndAt] = useState(null);
  const navigate = useNavigate();

  function swap() {
    // implement swapping logic here
    console.log("swap");
  }

  useEffect(() => {
    setEndAt(Date.now() + GAME_DURATION_MS);

    let calls = 0;
    const intervalId = setInterval(() => {
      calls += 1;
      swap();
      if (calls >= MAX_CALLS) {
        clearInterval(intervalId);
      }
    }, INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  const location = useLocation();
  const target = TARGETS.find(t => t.id === location.state?.picId) ?? TARGETS[0];

  return (
    <>
      {endAt && (
        <Countdown
          date={endAt}
          onComplete={() => navigate("/result")}
        />
      )}
    <Playground
      code={target.starter} image={target.image}
    />
    </>
  )
}

export default Editor 