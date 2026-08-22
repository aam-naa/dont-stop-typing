/* ─── Monaco themes ──────────────────────────────────────────────────────────
 *
 * This is the ONLY place in the app where colours live outside a .css file, and
 * it is unavoidable: monaco.editor.defineTheme() takes a plain object of hex
 * strings and Monaco cannot read CSS custom properties (it measures and paints
 * on a canvas). So each WebTUI theme gets a hand-mirrored Monaco counterpart,
 * built from the same palette hexes the theme packages define.
 *
 * Keep these in sync with src/styles/tokens.css when adding a theme.
 * ─────────────────────────────────────────────────────────────────────────── */

// Must match --font-family in src/styles/tokens.css. Monaco needs a literal
// string it can measure; it can't resolve a var().
export const MONO_STACK =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "DejaVu Sans Mono", monospace';

/**
 * One palette shape, three fillings. `p` is the palette; everything the editor
 * needs is derived from it so the three themes can't drift apart structurally.
 */
function build(p) {
  return {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: p.fg },
      { token: "comment", foreground: p.dim, fontStyle: "italic" },
      { token: "delimiter", foreground: p.punct },

      // HTML
      { token: "tag", foreground: p.tag },
      { token: "metatag", foreground: p.dim },
      { token: "attribute.name", foreground: p.attr },
      { token: "attribute.value", foreground: p.value },
      { token: "string", foreground: p.value },

      // CSS inside <style> — this is what the players actually write
      { token: "tag.css", foreground: p.tag },
      { token: "attribute.name.css", foreground: p.attr },
      { token: "attribute.value.css", foreground: p.value },
      { token: "attribute.value.number.css", foreground: p.number },
      { token: "attribute.value.unit.css", foreground: p.dim },
      { token: "attribute.value.hex.css", foreground: p.number },
      { token: "keyword", foreground: p.tag },
      { token: "number", foreground: p.number },
    ],
    colors: {
      "editor.background": `#${p.bg}`,
      "editor.foreground": `#${p.fg}`,
      "editorCursor.foreground": `#${p.accent}`,
      "editor.lineHighlightBackground": `#${p.bgAlt}`,
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": `#${p.gutter}`,
      "editorLineNumber.activeForeground": `#${p.accent}`,
      "editor.selectionBackground": `#${p.accent}33`,
      "editor.inactiveSelectionBackground": `#${p.accent}1a`,
      "editor.selectionHighlightBackground": `#${p.accent}22`,
      "editorGutter.background": `#${p.bg}`,
      "editorIndentGuide.background1": `#${p.bgAlt}`,
      "editorIndentGuide.activeBackground1": `#${p.gutter}`,
      "editorBracketMatch.background": "#00000000",
      "editorBracketMatch.border": `#${p.accent}`,
      "editorError.foreground": `#${p.err}`,
      "editorWarning.foreground": `#${p.accent}`,
      "editorWhitespace.foreground": `#${p.bgAlt}`,
      "editorOverviewRuler.border": "#00000000",
      "scrollbarSlider.background": `#${p.gutter}55`,
      "scrollbarSlider.hoverBackground": `#${p.gutter}88`,
      "scrollbarSlider.activeBackground": `#${p.gutter}aa`,
      "editorWidget.background": `#${p.bg}`,
      "editorWidget.border": `#${p.gutter}`,
      focusBorder: `#${p.accent}`,
    },
  };
}

export const MONACO_THEMES = {
  "gruvbox-dark": build({
    bg: "282828",
    bgAlt: "3c3836",
    fg: "ebdbb2",
    dim: "928374",
    gutter: "665c54",
    punct: "928374",
    tag: "83a598",
    attr: "b8bb26",
    value: "fabd2f",
    number: "d3869b",
    accent: "fabd2f",
    err: "fb4934",
  }),
  // Neovim's own palette, from src/nvim/highlight_group.c. Token assignments
  // follow nvim's dark default: Statement/Special blue, Identifier cyan,
  // String/Constant green, Number yellow, Comment grey.
  neovim: build({
    bg: "14161b", // NvimDarkGrey2  — nvim's dark Normal background
    bgAlt: "2c2e33", // NvimDarkGrey3  — CursorLine
    fg: "e0e2ea", // NvimLightGrey2 — Normal
    dim: "9b9ea4", // NvimLightGrey4 — Comment
    gutter: "4f5258", // NvimDarkGrey4  — LineNr
    punct: "9b9ea4",
    tag: "a6dbff", // NvimLightBlue
    attr: "8cf8f7", // NvimLightCyan
    value: "b3f6c0", // NvimLightGreen
    number: "fce094", // NvimLightYellow
    accent: "a6dbff",
    err: "ffc0b9", // NvimLightRed
  }),
  "catppuccin-mocha": build({
    bg: "1e1e2e",
    bgAlt: "313244",
    fg: "cdd6f4",
    dim: "6c7086",
    gutter: "45475a",
    punct: "9399b2",
    tag: "89b4fa",
    attr: "a6e3a1",
    value: "f9e2af",
    number: "fab387",
    accent: "f9e2af",
    err: "f38ba8",
  }),
};

export const monacoThemeName = (theme) => `dst-${theme}`;

/** Editor options shared by every mount. */
export function editorOptions(reducedMotion) {
  return {
    fontFamily: MONO_STACK,
    fontSize: 14,
    lineHeight: 21, // 14 * 1.5 — the same rhythm as the page
    fontLigatures: false,
    cursorStyle: "block",
    cursorBlinking: reducedMotion ? "solid" : "blink",
    minimap: { enabled: false },
    contextmenu: false,
    renderLineHighlight: "gutter",
    lineNumbersMinChars: 3,
    lineDecorationsWidth: 8,
    glyphMargin: false,
    folding: false,
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    // Rainbow brackets are the least terminal thing Monaco does by default.
    bracketPairColorization: { enabled: false },
    guides: { indentation: false },
    renderWhitespace: "none",
    occurrencesHighlight: "off",
    selectionHighlight: false,
    smoothScrolling: false,
    scrollBeyondLastLine: false,
    padding: { top: 12, bottom: 12 },
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
    wordWrap: "on",
    tabSize: 2,
  };
}
