import ThemeSwitcher from "./ThemeSwitcher";

/* A statusline segment.
 *
 * WebTUI's badge paints itself with a gradient plus 1ch end caps and reads
 * --badge-color / --badge-text. We drive those from our own semantic tokens via
 * data-tone (see layout.css) rather than the theme packages' variant- names,
 * because those names differ per theme — gruvbox and catppuccin both have
 * variant-="green", our neovim theme has no accent variants at all. */
export const Seg = ({ tone, children }) => (
  <span is-="badge" className="seg" data-tone={tone}>
    {children}
  </span>
);

/**
 * The chrome every route sits inside. Presentation only — it adds no behaviour
 * of its own beyond the theme switcher.
 *
 * Each page renders its own Shell and passes its own statusline, so there is no
 * context and no effect that has to sync route state upward.
 *
 * layout="column"  centred reading column, capped at 72ch
 * layout="wide"    full viewport, no padding (the editor)
 */
const Shell = ({ layout = "column", status, children }) => (
  <div className="shell" data-layout={layout}>
    <header className="shell-top">
      <ThemeSwitcher />
    </header>

    <main className="shell-main" data-layout={layout}>
      {children}
    </main>

    {status && <footer className="shell-status">{status}</footer>}
  </div>
);

export default Shell;
