import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell, { Seg } from "./components/Shell";
import { getUsername } from "./username.js";

const POLL_MS = 3000;

const LeaderBoard = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const me = getUsername();

  const load = useCallback(async (signal) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/leaderboard`, {
        signal,
      });
      const data = await res.json();
      setRows(data.rows ?? []);
      setError(data.error ?? null);
    } catch (err) {
      if (err.name !== "AbortError") setError("could not reach the server");
    } finally {
      setLoaded(true);
    }
  }, []);

  // Polled rather than pushed: the Supabase key stays on the server, so the
  // browser talks to our own /leaderboard proxy instead of subscribing directly.
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    const id = setInterval(() => load(controller.signal), POLL_MS);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [load]);

  const top = rows.length ? rows[0].score : 0;

  return (
    <Shell
      layout="column"
      status={
        <>
          <Seg>leaderboard</Seg>
          <Seg tone={error ? "err" : "ok"}>
            {error ? "offline" : `live · ${rows.length} players`}
          </Seg>
        </>
      }
    >
      <div className="col">
        <h2 className="rule">leaderboard</h2>

        {error && (
          <p className="msg" data-kind="err" role="alert">
            {error}
          </p>
        )}

        {loaded && rows.length === 0 && !error && (
          <p>no scores yet — play a round.</p>
        )}

        {rows.length > 0 && (
          <table className="board" divide-="horizontal">
            <thead>
              <tr>
                <th className="num">#</th>
                <th>player</th>
                <th className="num">score</th>
                <th>
                  <span className="sr-only">score bar</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} data-you={row.id === me}>
                  <td className="num">{i + 1}</td>
                  <td>{row.id === me ? `> ${row.id}` : row.id}</td>
                  <td className="num">{row.score}</td>
                  <td>
                    <span
                      className="bar"
                      data-pct={
                        top > 0 ? Math.round((row.score / top) * 20) * 5 : 0
                      }
                      role="img"
                      aria-label={`${row.score} points`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="actions">
          <button type="button" onClick={() => navigate("/")}>
            back
          </button>
        </div>
      </div>
    </Shell>
  );
};

export default LeaderBoard;
