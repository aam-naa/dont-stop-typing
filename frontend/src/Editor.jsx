"use client";
import { useEffect, useState } from 'react';
import Playground from './components/Playground';
import { useNavigate } from 'react-router-dom';
import Countdown from 'react-countdown'

const GAME_DURATION_MS = 0.5 * 60 * 1000; // 30s 

const renderer = ({ minutes, seconds }) => (
  <span>{minutes}:{String(seconds).padStart(2, '0')}</span>
);

const Editor = () => {
  const [endAt, setEndAt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setEndAt(Date.now() + GAME_DURATION_MS);
  }, []);

  return (
    <>
      {endAt && (
        <Countdown
          date={endAt}
          renderer={renderer}
          onComplete={() => navigate("/")}
        />
      )}
    <Playground
      code={`
<div class="a"></div>
<div class="b"></div>
<style>
body{background:#fff}
.a,.b{position:absolute;width:70px;height:70px;top:40px}
.a{left:20px;background:#dd6b4d}
.b{left:70px;background:#8a8a8a}
</style>
        `}
    />
    </>
  )
}

export default Editor 