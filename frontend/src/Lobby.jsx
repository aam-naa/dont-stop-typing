import { useState } from "react";
import { useNavigate } from "react-router";
import Shell, { Seg } from "./components/Shell";
import { TARGETS } from "./targets.js";
import { getUsername } from "./username.js";

function Lobby() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleCreate() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/create_room`, {
      method: "POST",
    });
    const { room_id } = await res.json();

    // Claim a slot in the room we just made, so the host gets a role too.
    const joinRes = await fetch(`${import.meta.env.VITE_API_URL}/join_room/${room_id}?username=${encodeURIComponent(getUsername())}`, {
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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/join_room/${joinCode}?username=${encodeURIComponent(getUsername())}`, {
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
    <Shell layout="column" status={<Seg>lobby</Seg>}>
      <div className="col">
        <section className="lobby-section">
          <h2 className="rule">new game</h2>
          <div className="actions">
            <button type="button" onClick={handleCreate}>
              Create Room
            </button>
          </div>
        </section>

        <section className="lobby-section">
          <h2 className="rule">join</h2>
          {/* The `>` sigil is a CSS-only affordance; the input stays
              uncontrolled and is still read via FormData on submit. */}
          <form className="prompt" onSubmit={handleSubmit}>
            <span className="prompt-sigil" aria-hidden="true">
              &gt;
            </span>
            <label className="prompt-field">
              <span className="sr-only">room code</span>
              <input name="room" placeholder="1234" />
            </label>
            <button type="submit">Join Room</button>
          </form>
        </section>

        {error && (
          <p className="msg" data-kind="err" role="alert">
            {error}
          </p>
        )}

        <section className="lobby-section">
          <h2 className="rule">targets</h2>
          <ul className="lobby-targets">
            {TARGETS.map((t) => (
              <li key={t.id}>
                <img src={t.image} alt={t.name} title={t.name} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
}

export default Lobby;
