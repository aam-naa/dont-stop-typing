import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/image.png";
import "./App.css";
import { useNavigate } from "react-router";

function Lobby() {
  const navigate = useNavigate();

  async function handleCreate() {
    const res = await fetch("http://127.0.0.1:8000/create_room", {
      method: "POST",
    });
    const { room_id } = await res.json();
    navigate(`/room/${room_id}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Read the form data
    const form = e.target;
    const formData = new FormData(form);
    const joinCode = formData.get("room");
    navigate(`/room/${joinCode}`);
    console.log(joinCode);
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Create or Join a Room</h1>
          <p>
            A party game for <code>coding</code> enthusiasts - test your{" "}
            <code>css</code>!
          </p>
        </div>
        <button type="button" onClick={handleCreate}>
          Create Room
        </button>
        <form onSubmit={handleSubmit}>
          <input name="room" />
          <button type="submit">Join Room</button>
        </form>
      </section>

      <section id="spacer"></section>
    </>
  );
}

export default Lobby;
