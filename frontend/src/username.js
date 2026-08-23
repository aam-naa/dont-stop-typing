const KEY = "dst.username";
const CLAIMED_KEY = "dst.claimed";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // private mode — it still works for this page's lifetime
  }
}

export function getUsername() {
  const name = read(KEY, "");
  return typeof name === "string" ? name : "";
}

export function setUsername(name) {
  write(KEY, name);
}

/* Every name this browser has successfully claimed.
 *
 * It is the only evidence we have that someone is a returning player rather
 * than a stranger typing a name that already exists — there is no auth. The
 * consequence is that coming back on a different device or browser reads as a
 * new player and the name will look taken. */
export function hasClaimed(name) {
  const claimed = read(CLAIMED_KEY, []);
  return Array.isArray(claimed) && claimed.includes(name);
}

export function rememberClaim(name) {
  const claimed = read(CLAIMED_KEY, []);
  const list = Array.isArray(claimed) ? claimed : [];
  if (!list.includes(name)) write(CLAIMED_KEY, [...list, name]);
}
