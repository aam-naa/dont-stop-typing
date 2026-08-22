// Imported as raw text, not embedded as a string literal: the art contains both
// backticks and backslashes, so a template literal would need every one escaped
// (and in a template literal a stray `\ ` silently swallows the backslash,
// quietly breaking the drawing). A .txt file has nothing to escape.
import ART from "./wordmark.txt?raw";

const TITLE = "don't stop typing";

/* 176 columns x 16 rows of plain ASCII punctuation — no box-drawing or block
 * glyphs at all, so unlike the earlier block version this renders correctly in
 * any monospace fallback even if the webfont never loads.
 *
 * At 176 columns the banner is 105.6em wide, so its font-size is driven off the
 * viewport rather than the type scale (see home.css). It is the one element on
 * the page whose size is dictated by its own geometry.
 *
 * The <pre> is aria-hidden and the real heading is the visually-hidden span — a
 * screen reader would otherwise read out a couple of thousand commas and
 * slashes. <pre> also can't live inside an <h1>, which takes only phrasing
 * content, hence the <header> wrapper. */
const Wordmark = () => (
  <header className="wordmark">
    <h1 className="sr-only">{TITLE}</h1>
    <pre className="wordmark-art" aria-hidden="true">
      {ART.trimEnd()}
    </pre>
  </header>
);

export default Wordmark;
