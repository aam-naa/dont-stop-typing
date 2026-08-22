import { Fragment } from "react";

/* typer's "tab restart · ctrl+q quit" line. Keep it short and only advertise
 * keys that are actually wired up — a hint line that lies is worse than none. */
const Hints = ({ items }) => (
  <p className="hints">
    {items.map(([key, label], i) => (
      <Fragment key={key}>
        {i > 0 && (
          <span className="hints-sep" aria-hidden="true">
            ·
          </span>
        )}
        <kbd>{key}</kbd> <span>{label}</span>
      </Fragment>
    ))}
  </p>
);

export default Hints;
