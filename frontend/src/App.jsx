import { useState } from "react";
import { useNavigate } from "react-router";
import Shell, { Seg } from "./components/Shell";
import Wordmark from "./components/Wordmark";
import Typewriter from "./components/Typewriter";
import {
  getUsername,
  setUsername,
  hasClaimed,
  rememberClaim,
} from "./username.js";

/* Split so the inline <code> survives being revealed a character at a time. */
const TAGLINE = [
  { text: "a party game for people who write " },
  { text: "css", code: true },
  { text: " by hand." },
];

function App() {
  const navigate = useNavigate();
  const [name, setName] = useState(getUsername);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setBusy(true);
    setError("");
    try {
      // A name this browser has claimed before is a returning player, so an
      // existing row is theirs rather than a clash.
      const returning = hasClaimed(trimmed);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/claim_username` +
          `?name=${encodeURIComponent(trimmed)}&returning=${returning}`,
        { method: "POST" },
      );
      if (res.status === 409) {
        setError("that name is already taken \u2014 pick another");
        return;
      }
      if (!res.ok) {
        setError("could not reach the leaderboard");
        return;
      }
      rememberClaim(trimmed);
      setUsername(trimmed);
      navigate("/lobby");
    } catch {
      setError("could not reach the leaderboard");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell layout="column" status={<Seg tone="accent">ready</Seg>}>
      {/* Outside .col on purpose: the banner is 176 characters wide and would
          be clipped by the column's 72ch reading cap. */}
      <Wordmark />

      <div className="col home">
        <Typewriter className="home-tagline" parts={TAGLINE} />

        <form
          className="prompt name-prompt"
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
        >
          <span className="prompt-sigil" aria-hidden="true">
            &gt;
          </span>
          <label className="prompt-field">
            <span className="sr-only">your name</span>
            <input
              name="username"
              value={name}
              onChange={(e) => {
                setName(e.target.value.slice(0, 24));
                setError("");
              }}
              placeholder="your name"
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
          </label>
        </form>

        {error && (
          <p className="msg" data-kind="err" role="alert">
            {error}
          </p>
        )}

        <div className="actions">
          <button type="button" onClick={start} disabled={!name.trim() || busy}>
            {busy ? "checking\u2026" : "Start Game"}
          </button>
          {!name.trim() && <span>enter a name first</span>}
        </div>
      </div>
    </Shell>
  );
}

export default App;
