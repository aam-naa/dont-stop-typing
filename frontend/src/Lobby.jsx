import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/image.png";
import "./App.css";
import { useNavigate } from "react-router";

function handleSubmit(e) {
  const navigate = useNavigate();
  // Prevent the browser from reloading the page
  e.preventDefault();

  // Read the form data
  const form = e.target;
  const formData = new FormData(form);
  const joinCode = formData.get("room");
  navigate(`/room/'${joinCode}'`)
  console.log(joinCode);
}

function Lobby() {
  const navigate = useNavigate();

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
        <button type="button" onClick={() => navigate("/create_room")}>
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
