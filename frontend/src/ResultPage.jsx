import { useLocation, useNavigate } from "react-router-dom";
import Shell, { Seg } from "./components/Shell";
import { TARGETS } from "./targets.js";

/* The layout is real; the numbers are not.
 *
 * Nothing in the app compares the player's render to the target yet, so rather
 * than print an invented "82% match" that looks like a measurement, the stat
 * rows show em-dashes until scoring exists. The shape of the screen is what is
 * being built here. */
const ResultPage = () => {
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
