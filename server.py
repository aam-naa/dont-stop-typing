from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import random
from fastapi.staticfiles import StaticFiles
rooms = {}

RESERVED = "reserved"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dont-stop-typing-game.vercel.app"],
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
    free = [r for r, wss in room.items() if wss is None]
    if not free:
        raise HTTPException(status_code=409, detail="Room is full")

    # Hold the slot so the next caller gets a different role. The websocket
    # swaps this for the real connection when the player actually showss up.
    role = free[0]
    room[role] = RESERVED
    return {"room_id": room_id, "role": role}

@app.websocket("/wss/{room_id}/{role}")
async def websocket_endpt(wss: WebSocket, room_id, role:int, num_players=5):
    if role not in range(num_players):
        await wss.close(code=4040)
        return

    if room_id not in rooms:
        await wss.close(code=4050)
        return

    room = rooms[room_id]

    # Free or merely reserved is fine; an active connection is not.
    if isinstance(room[role], WebSocket):
        await wss.close(code=4060)
        return

    await wss.accept()
    room[role] = wss
    await notify_room_status(wss, room_id)

    try:
        while True:
            data = await wss.receive_json()
            print(f"[{room_id}/{role}] received: {data}")
    except WebSocketDisconnect:
        room[role] = None


async def notify_room_status(wss:WebSocket, room_id: str):
    room = rooms[room_id]
    for player in room:
        if not isinstance(room[player], WebSocket):
            return
    await wss.send_json({"type": "all_connected"})