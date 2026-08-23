"use client";
import { useEffect, useState, useRef } from 'react';
import Playground from './components/Playground';
import { useNavigate, useParams } from 'react-router-dom';
import Countdown from 'react-countdown'
import {useLocation} from 'react-router-dom';
import {TARGETS} from './targets.js';

const GAME_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const INTERVAL_MS = 10 * 1000; // 1 minute 
const MAX_CALLS = 5;

const renderer = ({ minutes, seconds }) => (
  <span>{minutes}:{String(seconds).padStart(2, '0')}</span>
);

async function saveCode(roomId, role, code) {
  await fetch(`${import.meta.env.VITE_API_URL}/save_code/${roomId}/${role}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
}


const Editor = () => {
    const location = useLocation();
    const target = TARGETS.find(t => t.id === location.state?.picId) ?? TARGETS[0];
    const [rImage, setRImage] = useState(target.image);
    const [sImage, setSImage] = useState(target.starter);
    const { roomId, role } = useParams();
    const [endAt, setEndAt] = useState(null);
    const [ currCode, setCurrCode ] = useState(sImage);
    const navigate = useNavigate();
    const codeRef = useRef(currCode);

    useEffect(() => {
        if (!roomId || role === undefined) return;
        saveCode(roomId, role, sImage);
        console.log("saved starting")
    }, [roomId, role]);

    useEffect(() => { codeRef.current = currCode; }, [currCode]);

    async function swap() {
        console.log("swap");
        const roleNum = Number(role)
        await handleSwap(roomId, roleNum, codeRef.current);

        // debug: log current server state to the browser console
        const res = await fetch(`${import.meta.env.VITE_API_URL}/debug/state`);
        const state = await res.json();
        console.log("server state:", state);

        const roles = Object.keys(state.rooms[roomId]).map(Number).sort((a, b) => a - b);
        const nextRole = roles[(roles.indexOf(roleNum) + 1) % roles.length];
        console.log("swapping with role", nextRole, "of", roles);

        setRImage(state.player_code[roomId][nextRole])
        setSImage(state.chains[roomId][nextRole][0])
    }

    async function handleSwap(myRoomId, myRole, currentCode) {
        // Save my current code before I lose it
        await saveCode(myRoomId, myRole, currentCode);
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

    
    return (
        <>
        {endAt && (
            <Countdown
            date={endAt}
            onComplete={() => navigate("/result")}
            />
        )}
        <Playground
        code={sImage} image={rImage} onChange={setCurrCode}
        />
        </>
    )
}

export default Editor;
