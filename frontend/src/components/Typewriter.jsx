import { Fragment, useEffect, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";

// One character every 55ms — the pace the wordmark used to type at.
const CHARS_PER_TICK = 1;
const TICK_MS = 55;

/**
 * Renders the first `n` characters of `parts`, where a part is
 * `{ text }` or `{ text, code: true }` to wrap it in <code>.
 * Parts exist so the tagline's inline <code>css</code> survives being sliced
 * mid-sentence — a plain string couldn't carry it.
 */
function reveal(parts, n) {
  let left = n;
  return parts.map((part, i) => {
    const shown = part.text.slice(0, Math.max(0, left));
    left -= part.text.length;
    if (!shown) return null;
    return part.code ? (
      <code key={i}>{shown}</code>
    ) : (
      <Fragment key={i}>{shown}</Fragment>
    );
  });
}

const Typewriter = ({ parts, className }) => {
  const reduced = useReducedMotion();
  const total = parts.reduce((n, p) => n + p.text.length, 0);
  const [typed, setTyped] = useState(0);

  // Derived, so reduced motion needs no effect of its own.
  const shown = reduced ? total : typed;

  useEffect(() => {
    if (reduced || typed >= total) return;
    const id = setTimeout(
      () => setTyped((n) => Math.min(total, n + CHARS_PER_TICK)),
      TICK_MS,
    );
    return () => clearTimeout(id);
  }, [typed, total, reduced]);

  return (
    <p className={className}>
      {/* Two stacked copies in one grid cell (see home.css).
       *
       * The ghost holds the full text, so it fixes the paragraph's height and
       * nothing below it shifts as the line count grows while typing. It is
       * also the copy assistive tech reads — hence opacity rather than
       * visibility or aria-hidden, which would both remove it from the
       * accessibility tree.
       *
       * The animated copy is aria-hidden so a screen reader is never handed a
       * half-finished sentence. */}
      <span className="tw-ghost">{reveal(parts, total)}</span>
      <span className="tw-live" aria-hidden="true">
        {reveal(parts, shown)}
        {/* The caret only appears once the line has finished typing, so it
            reads as "done, waiting for you" rather than racing the text. */}
        {shown >= total && <span className="cursor" />}
      </span>
    </p>
  );
};

export default Typewriter;
