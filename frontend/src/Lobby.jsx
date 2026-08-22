import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/image.png";
import "./App.css";
import { useNavigate } from "react-router";

function Lobby() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleCreate() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/create_room`, {
      method: "POST",
    });
    const { room_id } = await res.json();

    // Claim a slot in the room we just made, so the host gets a role too.
    const joinRes = await fetch(`${import.meta.env.VITE_API_URL}/join_room/${room_id}`, {
      method: "POST",
    });
    const { role } = await joinRes.json();

    setError("");
    navigate(`/room/${room_id}?role=${role}`);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Read the form data
    const form = e.target;
    const formData = new FormData(form);
    const joinCode = formData.get("room");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/join_room/${joinCode}`, {
      method: "POST",
    });

    if (!res.ok){
      const {detail} = await res.json();
      setError(detail);
      return;
    }
    const {room_id, role} = await res.json();
    setError("");
    navigate(`/room/${room_id}?role=${role}`);
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
          <input name="room" placeholder="1234" />
          <button type="submit">Join Room</button>
        </form>
        {error && <p role="alert">{error}</p>}
      </section>

      <section id="spacer"></section>
    </>
  );
}

export default Lobby;
