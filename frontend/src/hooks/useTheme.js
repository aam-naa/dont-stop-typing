import { useSyncExternalStore } from "react";

/* The `value` strings matter more than they look.
 *
 * @webtui/theme-gruvbox maps --foreground0..2 and --background1..3 under
 *   [data-webtui-theme|="gruvbox-dark"]
 * and `|=` only matches the exact value or the value followed by "-". So plain
 * "gruvbox" matches ONLY the rule that sets --background0, leaving the
 * foregrounds at WebTUI's light-theme defaults (#000) — a dark page with black
 * text. "gruvbox-dark" is the value that actually works.
 *
 * catppuccin maps its backgrounds under |="catppuccin" and its palette under the
 * exact flavour names, so "catppuccin-mocha" is the safe value there too.
 * "neovim" is ours (src/styles/theme-neovim.css), matched exactly. */
export const THEMES = [
  { value: "gruvbox-dark", label: "gruvbox" },
  { value: "neovim", label: "neovim" },
  { value: "catppuccin-mocha", label: "catppuccin" },
];

export const DEFAULT_THEME = "gruvbox-dark";
const VALUES = THEMES.map((t) => t.value);
const STORAGE_KEY = "dst.theme";

/* A module-level store rather than a context, so the theme switcher in the
 * shell and the Monaco editor deep inside the playground stay in sync without
 * either of them caring where the other sits in the tree.
 *
 * The initial value is read off <html>, which index.html has already set from
 * localStorage before first paint — so there is no flash of the wrong theme. */

const listeners = new Set();

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  const current = document.documentElement.dataset.webtuiTheme;
  return VALUES.includes(current) ? current : DEFAULT_THEME;
}

export function setTheme(theme) {
  document.documentElement.dataset.webtuiTheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage — the theme still applies for this visit.
  }
  listeners.forEach((l) => l());
}

export function nextTheme(current) {
  const i = VALUES.indexOf(current);
  return VALUES[(i + 1) % VALUES.length];
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_THEME);
}
