#!/usr/bin/env python3
"""
Remote Car Control Server — MOR Services Company
شركة مور للخدمات — التحكم بالسيارة عن بعد

WebSocket server that simulates a car and accepts control commands.
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
log = logging.getLogger("mor-car-server")

WELCOME_MSG = (
    "MOR Services — Remote Car Control Server v2.0 | "
    "شركة مور للخدمات — التحكم بالسيارة عن بعد"
)


@dataclass
class CarState:
    x: float = 0.0
    y: float = 0.0
    heading: float = 0.0   # degrees, 0 = north, clockwise
    speed: float = 50.0    # 0–100
    lights: bool = False
    running: bool = True

    def to_dict(self) -> dict:
        d = asdict(self)
        d["heading"] = round(self.heading % 360, 2)
        return d


class CarSimulator:
    def __init__(self):
        self.state = CarState()
        self._origin = CarState()   # kept for reset

    def apply(self, cmd) -> dict:
        s = self.state
        t = cmd.type
        p = cmd.params

        if t == "move":
            if not s.running:
                return {"ok": False, "error": "Car is stopped — send 'start' / 'تشغيل' first"}
            dist = p["distance"]
            rad = math.radians(s.heading)
            sign = 1 if p["direction"] == "forward" else -1
            s.x += sign * dist * math.sin(rad)
            s.y += sign * dist * math.cos(rad)
            return {"ok": True, "moved": dist, "direction": p["direction"]}

        elif t == "turn":
            if not s.running:
                return {"ok": False, "error": "Car is stopped — send 'start' / 'تشغيل' first"}
            angle = p["angle"]
            s.heading += angle if p["direction"] == "right" else -angle
            s.heading %= 360
            return {"ok": True, "turned": angle, "direction": p["direction"]}

        elif t == "set_speed":
            value = max(0.0, min(100.0, p["value"]))
            s.speed = value
            return {"ok": True, "speed": value}

        elif t == "stop":
            s.running = False
            return {"ok": True, "message": "Car stopped | السيارة متوقفة"}

        elif t == "start":
            s.running = True
            return {"ok": True, "message": "Car started | السيارة تعمل"}

        elif t == "reset":
            self.state = CarState()
            return {"ok": True, "message": "Car reset to origin | إعادة ضبط السيارة", "state": self.state.to_dict()}

        elif t == "brake":
            if not s.running:
                return {"ok": False, "error": "Car is already stopped"}
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
        "message": WELCOME_MSG,
        "state": car.state.to_dict(),
        "company": {
            "name_en": "MOR Services Company",
            "name_ar": "شركة مور للخدمات",
            "phone": "920013104",
            "email": "info@mor.sa",
            "region": "Al-Qassim, Saudi Arabia",
        },
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
    log.info("Starting MOR Remote Car Control Server on ws://%s:%d", host, port)
    log.info("شركة مور للخدمات — القصيم — المملكة العربية السعودية")
    async with websockets.serve(handle_client, host, port):
        await asyncio.Future()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MOR Remote Car Control Server")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    asyncio.run(main(args.host, args.port))
