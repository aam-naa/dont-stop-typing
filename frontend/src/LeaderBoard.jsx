import { useNavigate } from "react-router-dom";
import Shell, { Seg } from "./components/Shell";

/* Sample rows, labelled as such in the statusline and in a note below the
 * table. The backend has no scoring, so nothing here is a real result — the
 * point is the layout. Percentages are in 5% steps because the bar is 20 cells
 * wide, so 5% is exactly one cell (see leaderboard.css). */
const ROWS = [
  { player: "p4", match: 95, time: "2:41", you: false },
  { player: "you", match: 80, time: "3:02", you: true },
  { player: "p1", match: 75, time: "3:11", you: false },
  { player: "p3", match: 50, time: "4:58", you: false },
  { player: "p5", match: 0, time: "—", you: false },
];

const LeaderBoard = () => {
  const navigate = useNavigate();

  return (
    <Shell
      layout="column"
      status={
        <>
          <Seg>leaderboard</Seg>
          <Seg tone="err">sample data</Seg>
        </>
      }
    >
      <div className="col">
        <h2 className="rule">leaderboard</h2>

        <table className="board" divide-="horizontal">
          <thead>
            <tr>
              <th className="num">#</th>
              <th>player</th>
              <th className="num">match</th>
              <th className="num">time</th>
              <th>
                <span className="sr-only">match bar</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.player} data-you={row.you}>
                <td className="num">{i + 1}</td>
                <td>{row.you ? `> ${row.player}` : row.player}</td>
                <td className="num">{row.match ? `${row.match}%` : "—"}</td>
                <td className="num">{row.time}</td>
                <td>
                  <span
                    className="bar"
                    data-pct={row.match}
                    role="img"
                    aria-label={`${row.match} percent match`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="msg" data-kind="err">
          placeholder rows &mdash; the backend does not score submissions yet
        </p>

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
