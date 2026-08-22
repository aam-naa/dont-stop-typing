import { useNavigate } from "react-router";
import Shell, { Seg } from "./components/Shell";
import Wordmark from "./components/Wordmark";
import Typewriter from "./components/Typewriter";

/* Split so the inline <code> survives being revealed a character at a time. */
const TAGLINE = [
  { text: "a party game for people who write " },
  { text: "css", code: true },
  { text: " by hand." },
];

function App() {
  const navigate = useNavigate();

  return (
    <Shell layout="column" status={<Seg tone="accent">ready</Seg>}>
      {/* Outside .col on purpose: the banner is 176 characters wide and would
          be clipped by the column's 72ch reading cap. */}
      <Wordmark />

      <div className="col home">
        <Typewriter className="home-tagline" parts={TAGLINE} />

        <div className="actions">
          <button type="button" onClick={() => navigate("/lobby")}>
            Start Game
          </button>
        </div>
      </div>
    </Shell>
  );
}

export default App;
