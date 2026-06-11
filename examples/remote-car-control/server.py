#!/usr/bin/env python3
"""
Remote Car Control Server

Simulates a car and accepts control commands over WebSocket.
Run: python server.py [--host HOST] [--port PORT]
"""

import asyncio
import json
import math
import argparse
import logging
from dataclasses import dataclass, asdict

import websockets

from car_command_parser import parse_command, ParseError

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("car-server")


@dataclass
class CarState:
    x: float = 0.0
    y: float = 0.0
    heading: float = 0.0   # degrees, 0 = north, clockwise
    speed: float = 50.0    # 0–100
    lights: bool = False
    running: bool = True

    def to_dict(self) -> dict:
        return {
            **asdict(self),
            "heading_deg": round(self.heading % 360, 2),
        }


class CarSimulator:
    def __init__(self):
        self.state = CarState()

    def apply(self, cmd) -> dict:
        s = self.state
        t = cmd.type
        p = cmd.params

        if t == "move":
            if not s.running:
                return {"ok": False, "error": "Car is stopped"}
            dist = p["distance"]
            rad = math.radians(s.heading)
            if p["direction"] == "forward":
                s.x += dist * math.sin(rad)
                s.y += dist * math.cos(rad)
            else:
                s.x -= dist * math.sin(rad)
                s.y -= dist * math.cos(rad)
            return {"ok": True, "moved": dist, "direction": p["direction"]}

        elif t == "turn":
            if not s.running:
                return {"ok": False, "error": "Car is stopped"}
            angle = p["angle"]
            if p["direction"] == "right":
                s.heading += angle
            else:
                s.heading -= angle
            s.heading %= 360
            return {"ok": True, "turned": angle, "direction": p["direction"]}

        elif t == "set_speed":
            value = max(0.0, min(100.0, p["value"]))
            s.speed = value
            return {"ok": True, "speed": value}

        elif t == "stop":
            s.running = False
            return {"ok": True, "message": "Car stopped"}

        elif t == "brake":
            s.speed = max(0.0, s.speed - 20.0)
            return {"ok": True, "speed": s.speed}

        elif t == "lights":
            s.lights = p["state"] == "on"
            return {"ok": True, "lights": s.lights}

        elif t == "status":
            return {"ok": True, "state": s.to_dict()}

        return {"ok": False, "error": f"Unhandled command: {t}"}


car = CarSimulator()
connected_clients: set = set()


async def broadcast_state():
    if connected_clients:
        msg = json.dumps({"event": "state_update", "state": car.state.to_dict()})
        await asyncio.gather(*(ws.send(msg) for ws in connected_clients), return_exceptions=True)


async def handle_client(websocket):
    addr = websocket.remote_address
    connected_clients.add(websocket)
    log.info("Client connected: %s", addr)

    await websocket.send(json.dumps({
        "event": "welcome",
        "message": "Remote Car Control Server v1.0",
        "state": car.state.to_dict(),
    }))

    try:
        async for raw in websocket:
            log.debug("Received from %s: %s", addr, raw)
            try:
                cmd = parse_command(raw.strip())
            except ParseError as exc:
                await websocket.send(json.dumps({"ok": False, "error": str(exc)}))
                continue

            if cmd is None:
                continue

            result = car.apply(cmd)
            result["command"] = raw.strip()
            await websocket.send(json.dumps(result))

            if cmd.type != "status":
                await broadcast_state()

    except websockets.exceptions.ConnectionClosed:
        log.info("Client disconnected: %s", addr)
    finally:
        connected_clients.discard(websocket)


async def main(host: str, port: int):
    log.info("Starting Remote Car Control Server on ws://%s:%d", host, port)
    async with websockets.serve(handle_client, host, port):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Remote Car Control Server")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    asyncio.run(main(args.host, args.port))
