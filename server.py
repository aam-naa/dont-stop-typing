from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random
import os
import json
import urllib.request
import urllib.parse
import urllib.error
import threading
from pydantic import BaseModel
rooms = {}

room_targets = {}

player_code = {}
chains = {}
votes = {}
usernames = {}
awarded = {}
# Every client posts /award when voting closes. FastAPI runs sync endpoints in
# a threadpool, so without this two of them can both pass the "already awarded"
# check before either records it and the room gets paid out twice.
_award_lock = threading.Lock()

NUM_TARGETS = 10

RESERVED = "reserved"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dont-stop-typing-game.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status":"healthy"}

class CodePayload(BaseModel):
    code: str

@app.post("/save_code/{room_id}/{role}")
def save_code(room_id: str, role: int, payload: CodePayload):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    player_code.setdefault(room_id, {})[role] = payload.code
    chains.setdefault(room_id, {})[role].append(payload.code)
    return {"status": "saved"}

@app.get("/get_code/{room_id}/{role}")
def get_code(room_id: str, role: int):
    code = player_code.get(room_id, {}).get(role)
    if code is None:
        raise HTTPException(status_code=404, detail="No code saved for this player")
    return {"code": code}

class VotePayload(BaseModel):
    best: int
    worst: int

@app.post("/vote/{room_id}/{role}")
def cast_vote(room_id: str, role: int, payload: VotePayload):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    # One vote per player; re-voting overwrites rather than stacking.
    votes.setdefault(room_id, {})[role] = {
        "best": payload.best,
        "worst": payload.worst,
    }
    return {"status": "ok", "received": len(votes[room_id])}

@app.get("/votes/{room_id}")
def get_votes(room_id: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    cast = votes.get(room_id, {})

    best_tally = {}
    worst_tally = {}
    for vote in cast.values():
        best_tally[vote["best"]] = best_tally.get(vote["best"], 0) + 1
        worst_tally[vote["worst"]] = worst_tally.get(vote["worst"], 0) + 1

    def winner(tally):
        if not tally:
            return None
        top = max(tally.values())
        # A draw is reported as a draw rather than silently picking one.
        tied = sorted(r for r, n in tally.items() if n == top)
        return {"roles": tied, "count": top}

    return {
        "votes": cast,
        "best_tally": best_tally,
        "worst_tally": worst_tally,
        "best": winner(best_tally),
        "worst": winner(worst_tally),
        "received": len(cast),
        "expected": len(rooms[room_id]),
    }

POINTS_BEST = 300
POINTS_WORST = 0
POINTS_OTHER = 100

def _load_env_file(path=".env"):
    """Minimal .env reader — no dependency, so requirements.txt is untouched.

    Real environment variables win, so Render's dashboard settings override the
    local file rather than the other way round.
    """
    try:
        with open(path, encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                os.environ.setdefault(
                    key.strip(), value.strip().strip('"').strip("'")
                )
    except FileNotFoundError:
        pass

_load_env_file()

# Never in source and never in the frontend bundle. Locally these come from the
# gitignored .env beside this file; on Render, from the dashboard. If they are
# missing the game still works, it just skips the leaderboard and says so.
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

def _supabase(method, path, body=None, extra_headers=None):
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("apikey", SUPABASE_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
    req.add_header("Content-Type", "application/json")
    for key, value in (extra_headers or {}).items():
        req.add_header(key, value)
    with urllib.request.urlopen(req, timeout=10) as res:
        raw = res.read().decode()
        return json.loads(raw) if raw else None

def add_score(username, points):
    """Read-modify-write, so scores accumulate across games."""
    ident = urllib.parse.quote(username, safe="")
    rows = _supabase("GET", f"leaderboard?select=score&id=eq.{ident}")
    current = rows[0]["score"] if rows else 0
    _supabase(
        "POST",
        "leaderboard",
        [{"id": username, "score": current + points}],
        {"Prefer": "resolution=merge-duplicates"},
    )
    return current + points

@app.get("/leaderboard")
def leaderboard(limit: int = 50):
    """Proxy the Supabase table so the key stays server-side.

    The frontend polls this; it never sees SUPABASE_KEY.
    """
    if not (SUPABASE_URL and SUPABASE_KEY):
        return {"rows": [], "error": "SUPABASE_URL / SUPABASE_KEY not set"}
    try:
        rows = _supabase(
            "GET", f"leaderboard?select=id,score&order=score.desc,id.asc&limit={int(limit)}"
        )
        return {"rows": rows or [], "error": None}
    except Exception as exc:
        return {"rows": [], "error": str(exc)}

@app.post("/claim_username")
def claim_username(name: str, returning: bool = False):
    """Reserve a name by inserting the row.

    Done as an insert rather than a select-then-insert so the table's primary
    key settles races: two new players picking the same name at the same moment
    cannot both succeed. A 409 from PostgREST means the row already exists.

    `returning=true` means the client has this name in its own claimed list, so
    an existing row is that player coming back rather than a clash — they are
    let through and their score keeps accumulating. There is no auth here, so
    that claim is only as trustworthy as the browser making it.
    """
    name = (name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name required")
    if not (SUPABASE_URL and SUPABASE_KEY):
        # No credentials configured — let play continue unblocked.
        return {"claimed": True, "checked": False, "new": True}
    try:
        _supabase("POST", "leaderboard", [{"id": name, "score": 0}])
        return {"claimed": True, "checked": True, "new": True}
    except urllib.error.HTTPError as exc:
        if exc.code == 409:
            if returning:
                return {"claimed": True, "checked": True, "new": False}
            raise HTTPException(status_code=409, detail="Username already exists")
        raise HTTPException(status_code=502, detail=f"Leaderboard unavailable: {exc}")

@app.post("/award/{room_id}")
def award(room_id: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    with _award_lock:
        return _award_locked(room_id)

def _award_locked(room_id: str):
    if room_id in awarded:
        return awarded[room_id]

    tally = get_votes(room_id)
    best_roles = set(tally["best"]["roles"]) if tally["best"] else set()
    worst_roles = set(tally["worst"]["roles"]) if tally["worst"] else set()

    results = []
    for role in rooms[room_id]:
        name = usernames.get(room_id, {}).get(role) or f"player {role + 1}"
        if role in best_roles:
            points, kind = POINTS_BEST, "best"
        elif role in worst_roles:
            points, kind = POINTS_WORST, "worst"
        else:
            points, kind = POINTS_OTHER, "other"
        results.append(
            {"role": role, "username": name, "points": points, "kind": kind}
        )

    written, error = False, None
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            for row in results:
                row["total"] = add_score(row["username"], row["points"])
            written = True
        except Exception as exc:
            error = str(exc)
    else:
        error = "SUPABASE_URL / SUPABASE_KEY not set"

    payload = {"results": results, "written": written, "error": error}
    awarded[room_id] = payload
    return payload

@app.post("/create_room")
def create_room(num_players=3):
    code = str(random.randint(1000, 9999))
    rooms[code] = {}
    chains[code] = {}
    player_code[code] = {}
    votes[code] = {}
    usernames[code] = {}

    room = rooms[code]
    chain = chains[code]
    pc = player_code[code]
    for i in range(num_players):
        room[i] = None
        chain[i] = [] 
        pc[i] = ""
    room_targets[code] = random.sample(range(NUM_TARGETS), num_players)
    return {"room_id": code}

@app.post("/join_room/{room_id}")
async def join_room(room_id: str, username: str = None):
    room = rooms.get(room_id)
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    free = [r for r, ws in room.items() if ws is None]
    if not free:
        raise HTTPException(status_code=409, detail="Room is full")

    # Hold the slot so the next caller gets a different role. The websocket
    # swaps this for the real connection when the player actually shows up.
    role = free[0]
    room[role] = RESERVED
    if username:
        usernames.setdefault(room_id, {})[role] = username
    await broadcast_room_status(room_id)
    return {"room_id": room_id, "role": role}

@app.websocket("/ws/{room_id}/{role}")
async def websocket_endpt(ws: WebSocket, room_id, role:int, num_players=3):
    await ws.accept()
    if role not in range(num_players):
        await ws.close(code=4040)
        return

    if room_id not in rooms:
        await ws.close(code=4050)
        return

    room = rooms[room_id]

    # Free or merely reserved is fine; an active connection is not.
    if isinstance(room[role], WebSocket):
        await ws.close(code=4060)
        return

    room[role] = ws
    await broadcast_room_status(room_id)

    try:
        while True:
            data = await ws.receive_json()
            print(f"[{room_id}/{role}] received: {data}")
    except WebSocketDisconnect:
        room[role] = None
        await broadcast_room_status(room_id)

async def broadcast_room_status(room_id: str):
    room = rooms.get(room_id)
    if room is None:
        return
    status = {
        "type": "room_status",
        "players": {
            str(role): (
                "connected" if isinstance(state, WebSocket)
                else "reserved" if state == RESERVED
                else "waiting"
            )
            for role, state in room.items()
        },
    }
    for state in room.values():
        if isinstance(state, WebSocket):
            try:
                await state.send_json(status)
            except Exception:
                pass  # client may have just disconnected; ignore

    if all(isinstance(state, WebSocket) for state in room.values()):
        pic_ids = random.sample(range(0, NUM_TARGETS), NUM_TARGETS)
        for i, state in enumerate(room.values()):
            if isinstance(state, WebSocket):
                try:
                    await state.send_json({"type": "all_connected", "pic_id": pic_ids[i]})
                except Exception:
                    pass

@app.get("/debug/state")
def debug_state():
    return {
        "rooms": {
            room_id: {role: ("connected" if isinstance(v, WebSocket) else v) for role, v in room.items()}
            for room_id, room in rooms.items()
        },
        "player_code": player_code,
        "chains": chains,
        "usernames": usernames,
    }