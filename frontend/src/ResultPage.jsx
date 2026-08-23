import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Countdown from "react-countdown";
import Shell, { Seg } from "./components/Shell";
import { SHELL } from "./targets.js";
import { useReducedMotion } from "./hooks/useReducedMotion";

const VOTE_MS = 30 * 1000;
const SLIDE_MS = 6000;
const COUNT_MS = 1400;
const POLL_MS = 1000;
const POLL_GRACE_MS = 10 * 1000;

// Names, not hexes — the colours themselves live in styles/result.css so a
// player can be told "vote amber" rather than having to describe a swatch.
const COLOUR_NAMES = ["crimson", "amber", "azure", "mint", "violet"];

/* Rebuild each image's journey from the flat per-role chains.
 *
 * chains[R] is keyed by who SAVED an entry, not by which image it belongs to,
 * so a lineage has to be derived from the rotation Editor.jsx uses:
 *   chains[R][0]  R's own starting image
 *   chains[R][1]  R's work on it
 *   chains[P][k]  for k >= 2, where P is the player who receives from R
 *                 (P is the role whose nextRole === R, i.e. R's predecessor)
 *
 * If the rotation in Editor.jsx ever changes, this has to change with it. */
function buildLineages(chainsForRoom) {
  const roles = Object.keys(chainsForRoom)
    .map(Number)
    .sort((a, b) => a - b);
  const n = roles.length;
  if (!n) return { roles: [], lineages: [] };

  const predecessorOf = (role) =>
    roles[(roles.indexOf(role) - 1 + n) % n];

  const lineages = roles.map((owner) => {
    const own = chainsForRoom[String(owner)] ?? [];
    const steps = [];
    if (own[0] !== undefined) steps.push({ code: own[0], author: null });
    if (own[1] !== undefined) steps.push({ code: own[1], author: owner });

    const handler = predecessorOf(owner);
    const handed = chainsForRoom[String(handler)] ?? [];
    for (let k = 2; k < handed.length; k += 1) {
      steps.push({ code: handed[k], author: handler });
    }
    return { owner, steps };
  });

  return { roles, lineages };
}

const CountUp = ({ to }) => {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? to : 0);

  useEffect(() => {
    if (reduced || to === 0) {
      setShown(to);
      return;
    }
    let frame;
    let started;
    const step = (now) => {
      if (started === undefined) started = now;
      const progress = Math.min(1, (now - started) / COUNT_MS);
      // ease-out cubic, so it decelerates into the final number
      setShown(Math.round(to * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    // rAF is throttled to a standstill in a background tab, which would leave
    // the score stuck at 0. Land on the real number regardless.
    const settle = setTimeout(() => setShown(to), COUNT_MS + 300);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [to, reduced]);

  return <span className="countup">{shown}</span>;
};

const SLIDE_TITLES = ["winner", "loser", "everyone else"];

const Podium = ({ group, empty, imagesBy, colourOf }) => {
  if (group.length === 0) return <p>{empty}</p>;
  return (
    <div className="podium">
      {group.map((player) => {
        const colour = colourOf(player.role);
        return (
          <div className="podium-player" key={player.role} data-colour={colour}>
            <div className="podium-head">
              <span className="podium-name">{player.username}</span>
              <span className="podium-points">
                <CountUp to={player.points} /> pts
              </span>
            </div>
            <ol className="lineage-steps">
              {imagesBy(player.role).map((step, i) => (
                <li className="lineage-step" key={i} data-colour={colour}>
                  <div className="canvas canvas-thumb">
                    <iframe
                      title={`${player.username} image ${i}`}
                      srcDoc={SHELL(step.code)}
                      sandbox=""
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
};

const ResultPage = () => {
  const { roomId, role } = useParams();
  const myRole = Number(role);

  const [chains, setChains] = useState(null);
  const [error, setError] = useState("");
  const [best, setBest] = useState(null);
  const [worst, setWorst] = useState(null);
  const [phase, setPhase] = useState("loading");
  const [tally, setTally] = useState(null);
  const [awards, setAwards] = useState(null);
  const [slide, setSlide] = useState(0);
  const [endAt] = useState(() => Date.now() + VOTE_MS);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/debug/state`);
        const state = await res.json();
        if (!alive) return;
        const forRoom = state.chains?.[roomId];
        if (!forRoom) {
          setError(`room ${roomId} is no longer on the server`);
          setPhase("error");
          return;
        }
        setChains(forRoom);
        setPhase("vote");
      } catch {
        if (alive) {
          setError("could not reach the server");
          setPhase("error");
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [roomId]);

  const { roles, lineages } = useMemo(
    () => (chains ? buildLineages(chains) : { roles: [], lineages: [] }),
    [chains],
  );

  const colourOf = useCallback(
    (author) => (author === null ? null : roles.indexOf(author)),
    [roles],
  );

  const closeVoting = useCallback(async () => {
    setPhase("tallying");
    try {
      if (best !== null && worst !== null) {
        await fetch(`${import.meta.env.VITE_API_URL}/vote/${roomId}/${myRole}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ best: roles[best], worst: roles[worst] }),
        });
      }
      const deadline = Date.now() + POLL_GRACE_MS;
      let result = null;
      for (;;) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/votes/${roomId}`,
        );
        result = await res.json();
        if (result.received >= result.expected || Date.now() > deadline) break;
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
      setTally(result);

      // Idempotent on the server, so every client calling it is fine.
      const awardRes = await fetch(
        `${import.meta.env.VITE_API_URL}/award/${roomId}`,
        { method: "POST" },
      );
      const awarded = await awardRes.json();
      setAwards(awarded);
      setPhase("done");

      const label = (w) =>
        w ? w.roles.map((r) => `player ${r + 1} (${COLOUR_NAMES[roles.indexOf(r)]})`).join(", ") : "no votes";
      console.log("BEST voted:", label(result.best));
      console.log("WORST voted:", label(result.worst));
      console.log("full tally:", result);
      console.log("points awarded:", awarded);
    } catch {
      setError("could not reach the server");
      setPhase("error");
    }
  }, [best, worst, roles, roomId, myRole]);

  const voting = phase === "vote";
  const revealed = phase === "done";

  const grouped = useMemo(() => {
    const rows = awards?.results ?? [];
    return {
      best: rows.filter((r) => r.kind === "best"),
      worst: rows.filter((r) => r.kind === "worst"),
      other: rows.filter((r) => r.kind === "other"),
    };
  }, [awards]);

  const imagesBy = useCallback(
    (author) =>
      lineages.flatMap((l) => l.steps.filter((step) => step.author === author)),
    [lineages],
  );

  useEffect(() => {
    if (!revealed || slide >= 2) return;
    const timer = setTimeout(() => setSlide((n) => n + 1), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [revealed, slide]);


  return (
    <Shell
      layout="column"
      status={
        <>
          <Seg tone="accent">room {roomId}</Seg>
          {voting && (
            <Seg>
              <Countdown
                date={endAt}
                onComplete={closeVoting}
                renderer={({ seconds }) => <>{seconds}s to vote</>}
              />
            </Seg>
          )}
          {phase === "tallying" && <Seg>counting votes…</Seg>}
          {revealed && <Seg tone="ok">results</Seg>}
        </>
      }
    >
      <div className="col results">
        <h2 className="rule">how each image travelled</h2>

        {phase === "loading" && <p>loading…</p>}
        {error && (
          <p className="msg" data-kind="err" role="alert">
            {error}
          </p>
        )}

        {lineages.map(({ owner, steps }) => (
          <div className="lineage" key={owner}>
            <span className="lineage-label">image {roles.indexOf(owner) + 1}</span>
            <ol className="lineage-steps">
              {steps.map((step, i) => {
                const colour = colourOf(step.author);
                return (
                  <li
                    key={i}
                    className="lineage-step"
                    data-colour={colour ?? "none"}
                  >
                    <div className="canvas canvas-thumb">
                      <iframe
                        title={`image ${owner} step ${i}`}
                        srcDoc={SHELL(step.code)}
                        sandbox=""
                      />
                    </div>
                    <span className="lineage-author">
                      {step.author === null
                        ? "start"
                        : revealed
                          ? `player ${step.author + 1} · ${COLOUR_NAMES[colour]}`
                          : COLOUR_NAMES[colour]}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}

        {voting && (
          <>
            <h2 className="rule">vote</h2>
            <p>pick the colour you think did best, and the one that did worst.</p>

            {["best", "worst"].map((kind) => (
              <div className="vote-row" data-kind={kind} key={kind}>
                <span className="vote-label">{kind}</span>
                <div className="actions">
                  {roles.map((_, i) => {
                    const selected = kind === "best" ? best === i : worst === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        className="vote-btn"
                        data-colour={i}
                        aria-pressed={selected}
                        onClick={() =>
                          kind === "best" ? setBest(i) : setWorst(i)
                        }
                      >
                        {COLOUR_NAMES[i]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="actions">
              <button
                type="button"
                onClick={closeVoting}
                disabled={best === null || worst === null}
              >
                submit vote
              </button>
              {(best === null || worst === null) && (
                <span>pick one of each</span>
              )}
            </div>
          </>
        )}

        {revealed && awards && (
          <>
            <h2 className="rule">{SLIDE_TITLES[slide]}</h2>

            {slide === 0 && (
              <Podium
                group={grouped.best}
                empty="nobody got a vote"
                imagesBy={imagesBy}
                colourOf={colourOf}
              />
            )}

            {slide === 1 && (
              <>
                <Podium
                  group={grouped.worst}
                  empty="nobody got a vote"
                  imagesBy={imagesBy}
                  colourOf={colourOf}
                />
                {grouped.worst.length > 0 && <p>sucks to lose lol</p>}
              </>
            )}

            {slide === 2 && (
              <Podium
                group={grouped.other}
                empty="everyone was either best or worst"
                imagesBy={imagesBy}
                colourOf={colourOf}
              />
            )}

            <div className="actions">
              <button
                type="button"
                onClick={() => setSlide((n) => Math.max(0, n - 1))}
                disabled={slide === 0}
              >
                back
              </button>
              <button
                type="button"
                onClick={() => setSlide((n) => Math.min(2, n + 1))}
                disabled={slide === 2}
              >
                next
              </button>
              <span>
                {slide + 1}/3 · {tally.received}/{tally.expected} voted
              </span>
            </div>

            {awards.error && (
              <p className="msg" data-kind="err">
                leaderboard not updated: {awards.error}
              </p>
            )}
          </>
        )}
      </div>
    </Shell>
  );
};

export default ResultPage;
