"use client";
import { useEffect, useState } from 'react';
import Playground from './components/Playground';
import { useNavigate } from 'react-router-dom';
import Countdown from 'react-countdown'
import {useLocation} from 'react-router-dom';
import {TARGETS} from './targets.js';

const GAME_DURATION_MS = 5 * 60 * 1000; // 30s 

const renderer = ({ minutes, seconds }) => (
  <span>{minutes}:{String(seconds).padStart(2, '0')}</span>
);

const Editor = () => {
  const [endAt, setEndAt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setEndAt(Date.now() + GAME_DURATION_MS);
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