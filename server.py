import os
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import random

rooms = {}

app = FastAPI()

static_dir = f"/frontend/dist"
if os.getenv("IS_LOCAL_STATIC_DIR") == "true":
    static_dir = f"frontend/dist"

app.mount(
    "/frontend",
    StaticFiles(directory=static_dir, html=False),
    name="frontend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message":"hey"}

@app.post("/create_room")
def create_room(num_players=5):
    code = str(random.randint(1000, 9999))
    rooms[code] = {}
    room = rooms[code]
    for i in range(num_players):
        room[i] = None
    return {"room_id": code}

@app.websocket("/ws/{room_id}/{role}")
async def websocket_endpt(ws: WebSocket, room_id, role:int, num_players=5):
    if role not in range(num_players):
        await ws.close(code=4040)
        return

    if room_id not in rooms:
        await ws.close(code=4050)
        return

    room = rooms[room_id]

    if room[role] is not None:
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
        if room[player] is None:
            return
    await ws.send_json({"type": "all_connected"})
