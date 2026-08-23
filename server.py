from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random
from pydantic import BaseModel
rooms = {}

room_targets = {}

player_code = {}
chains = {}

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

@app.post("/create_room")
def create_room(num_players=2):
    code = str(random.randint(1000, 9999))
    rooms[code] = {}
    chains[code] = {}
    player_code[code] = {}

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
async def join_room(room_id: str):
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
    await broadcast_room_status(room_id)
    return {"room_id": room_id, "role": role}

@app.websocket("/ws/{room_id}/{role}")
async def websocket_endpt(ws: WebSocket, room_id, role:int, num_players=5):
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
    }