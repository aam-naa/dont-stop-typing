import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import random
import os
from fastapi.staticfiles import StaticFiles

# Determine the path to the built frontend
static_dir = f"/frontend/dist"
if os.getenv("IS_LOCAL_STATIC_DIR") == "true":
    static_dir = f"frontend/dist"

# Mount the directory. 
# html=False means it won't automatically search for index.html; we handle that manually.
app.mount(
    "/frontend",
    StaticFiles(directory=static_dir, html=True),
    name="frontend"
)

rooms = {}

RESERVED = "reserved"

app = FastAPI()

# Absolute, derived from this file's location, so it resolves the same
# regardless of the working directory the host launches uvicorn from.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.getenv("STATIC_DIR", os.path.join(BASE_DIR, "frontend", "dist"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/create_room")
def create_room(num_players=5):
    code = str(random.randint(1000, 9999))
    rooms[code] = {}
    room = rooms[code]
    for i in range(num_players):
        room[i] = None
    return {"room_id": code}

@app.post("/join_room/{room_id}")
def join_room(room_id: str):
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
    return {"room_id": room_id, "role": role}

@app.websocket("/ws/{room_id}/{role}")
async def websocket_endpt(ws: WebSocket, room_id, role:int, num_players=5):
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

    await ws.accept()
    room[role] = ws
    await notify_room_status(ws, room_id)

    try:
        while True:
            data = await ws.receive_json()
            print(f"[{room_id}/{role}] received: {data}")
    except WebSocketDisconnect:
        room[role] = None


async def notify_room_status(ws:WebSocket, room_id: str):
    room = rooms[room_id]
    for player in room:
        if not isinstance(room[player], WebSocket):
            return
    await ws.send_json({"type": "all_connected"})


# Registered last on purpose: Starlette matches routes in order, so this
# catch-all must not shadow any API route above it.
@app.get("/{full_path:path}")
async def frontend(full_path: str):
    candidate = os.path.normpath(os.path.join(STATIC_DIR, full_path))

    # Stop a crafted path (../../etc/passwd) from escaping the build dir.
    if candidate.startswith(STATIC_DIR) and os.path.isfile(candidate):
        return FileResponse(candidate)

    # Unknown paths fall back to index.html so client-side routes like
    # /room/1234 survive a page refresh.
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))
