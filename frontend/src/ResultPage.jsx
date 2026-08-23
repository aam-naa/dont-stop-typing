import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Shell, { Seg } from "./components/Shell";
import { TARGETS } from "./targets.js";
import "animate.css";

const ANTICIPATE_MS = 1400;
const HOLD_MS = 1200;

const ResultPage = () => {
  const { roomId, role } = useParams();
  const roleNum = Number(role);
  const location = useLocation();
  const navigate = useNavigate();
  const target = TARGETS.find((t) => t.id === location.state?.targetId) ?? TARGETS[0];

  const [step, setStep] = useState("intro");       // intro -> target -> reveal-N -> vote -> done
  const [players, setPlayers] = useState({});       // {role: code}
  const [revealIndex, setRevealIndex] = useState(0);
  const [anticipating, setAnticipating] = useState(true);
  const [selectedBest, setSelectedBest] = useState(null);
  const [selectedWorst, setSelectedWorst] = useState(null);
  const [results, setResults] = useState(null);

  const roles = Object.keys(players).map(Number);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/get_room_code/${roomId}`)
      .then((r) => r.json())
      .then((data) => setPlayers(data.players));
  }, [roomId]);

  useEffect(() => {
    if (step !== "intro") return;
    const t = setTimeout(() => setStep("target"), 1800);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step !== "target") return;
    const t = setTimeout(() => setStep("reveal"), HOLD_MS + 800);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step !== "reveal" || roles.length === 0) return;
    setAnticipating(true);
    const anticipateTimer = setTimeout(() => setAnticipating(false), ANTICIPATE_MS);
    const advanceTimer = setTimeout(() => {
      if (revealIndex + 1 < roles.length) {
        setRevealIndex((i) => i + 1);
      } else {
        setStep("vote");
      }
    }, ANTICIPATE_MS + HOLD_MS);
    return () => {
      clearTimeout(anticipateTimer);
      clearTimeout(advanceTimer);
    };
  }, [step, revealIndex, roles.length]);

  async function submitVote() {
    if (selectedBest === null || selectedWorst === null) return;
    await fetch(`${import.meta.env.VITE_API_URL}/vote/${roomId}/${roleNum}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ best: selectedBest, worst: selectedWorst }),
    });
    const res = await fetch(`${import.meta.env.VITE_API_URL}/results/${roomId}`);
    setResults(await res.json());
    setStep("done");
  }

  const currentRevealRole = roles[revealIndex];

  return (
    <div style={{ position: "relative" }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: -1 }}
      >
        <source src="/bg-loop.mp4" type="video/mp4" />
      </video>

      <Shell layout="column" status={<Seg tone="accent">{target.name}</Seg>}>
        <div className="col">
          {step === "intro" && (
            <h2 className="animate__animated animate__fadeIn">the target was...</h2>
          )}

          {step === "target" && (
            <figure className="editor-figure animate__animated animate__bounceIn">
              <figcaption>target</figcaption>
              <div className="canvas">
                <img src={target.image} alt="the composition everyone was given" />
              </div>
            </figure>
          )}

          {step === "reveal" && currentRevealRole !== undefined && (
            <figure className="editor-figure">
              <figcaption>player {currentRevealRole + 1}</figcaption>
              <div className="canvas">
                {anticipating ? (
                  <div className="animate__animated animate__pulse animate__infinite" style={{ padding: "2rem" }}>
                    ?
                  </div>
                ) : (
                  <iframe
                    key={currentRevealRole}
                    title={`player-${currentRevealRole}`}
                    srcDoc={players[currentRevealRole]}
                    sandbox=""
                    className="animate__animated animate__zoomIn"
                  />
                )}
              </div>
            </figure>
          )}

          {step === "vote" && (
            <div className="col">
              <h2 className="rule">vote</h2>
              <div className="compare">
                {roles.map((r) => (
                  <figure key={r} className="editor-figure">
                    <figcaption>player {r + 1}</figcaption>
                    <div className="canvas">
                      <iframe title={`vote-${r}`} srcDoc={players[r]} sandbox="" />
                    </div>
                    <div className="actions">
                      <button
                        type="button"
                        onClick={() => setSelectedBest(r)}
                        style={selectedBest === r ? { fontWeight: 500 } : {}}
                      >
                        best
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedWorst(r)}
                        style={selectedWorst === r ? { fontWeight: 500 } : {}}
                      >
                        worst
                      </button>
                    </div>
                  </figure>
                ))}
              </div>
              <button
                type="button"
                disabled={selectedBest === null || selectedWorst === null}
                onClick={submitVote}
              >
                submit vote
              </button>
            </div>
          )}

          {step === "done" && results && (
            <div className="col">
              <h2 className="rule">scores</h2>
              {roles.map((r) => (
                <p key={r}>
                  player {r + 1}: {results.points[r]} points
                  {results.best === r && " (best)"}
                  {results.worst === r && " (worst)"}
                </p>
              ))}
              <button type="button" onClick={() => navigate("/lobby")}>play again</button>
              <button type="button" onClick={() => navigate("/leaderboard")}>leaderboard</button>
            </div>
          )}
        </div>
      </Shell>
    </div>
  );
};
export default ResultPage;

/*



import { useLocation, useNavigate } from "react-router-dom";
import Shell, { Seg } from "./components/Shell";
import { TARGETS } from "./targets.js";
import 'animate.css'; */

/* The layout is real; the numbers are not.
 *
 * Nothing in the app compares the player's render to the target yet, so rather
 * than print an invented "82% match" that looks like a measurement, the stat
 * rows show em-dashes until scoring exists. The shape of the screen is what is
 * being built here. */
/*const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const target =
    TARGETS.find((t) => t.id === location.state?.targetId) ?? TARGETS[0];
  const code = location.state?.code ?? target.starter;

  return (
    <Shell
      layout="column"
      status={
        <>
          <Seg tone="accent">{target.name}</Seg>
          <Seg>time up</Seg>
        </>
      }
    >
      <div className="col">
        <h2 className="rule">result</h2>

        <div className="stats">
          <div className="stat">
            <span className="stat-value">&mdash;</span>
            <span className="stat-label">pixel match</span>
          </div>
          <div className="stat">
            <span className="stat-value">&mdash;</span>
            <span className="stat-label">place</span>
          </div>
        </div>

        <p className="msg" data-kind="err">
          scoring is not wired up yet, so these are unset rather than estimated
        </p>

        <h2 className="rule">compare</h2>
        <div className="compare">
          <figure className="editor-figure">
            <figcaption>target</figcaption>
            <div className="canvas">
              <img src={target.image} alt="the composition you were given" />
            </div>
          </figure>
          <figure className="editor-figure">
            <figcaption>yours</figcaption>
            <div className="canvas">
              <iframe title="your result" srcDoc={code} sandbox="" />
            </div>
          </figure>
        </div>

        <div className="actions">
          <button type="button" onClick={() => navigate("/lobby")}>
            play again
          </button>
          <button
            type="button"
            box-="square"
            onClick={() => navigate("/leaderboard")}
          >
            leaderboard
          </button>
        </div>
      </div>
    </Shell>
  );
};

export default ResultPage;
*/
