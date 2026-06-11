#!/usr/bin/env python3
"""
Non-interactive demo: connects to the server and runs a scripted sequence.
"""

import asyncio
import json
import websockets

SCRIPT = [
    "status",
    "lights on",
    "set speed 80",
    "move forward 100",
    "turn right 90",
    "move forward 50",
    "turn left 45",
    "move backward 20",
    "set speed 0",
    "brake",
    "lights off",
    "stop",
    "status",
]


async def run_demo(host="localhost", port=8765):
    uri = f"ws://{host}:{port}"
    print(f"Connecting to {uri}…")
    async with websockets.connect(uri) as ws:
        # discard welcome
        welcome = json.loads(await ws.recv())
        print(f"[Server] {welcome['message']}\n")

        for cmd in SCRIPT:
            print(f">>> {cmd}")
            await ws.send(cmd)
            reply = json.loads(await ws.recv())

            if reply.get("event") == "state_update":
                reply = json.loads(await ws.recv())

            if "state" in reply:
                s = reply["state"]
                print(
                    f"    pos=({s['x']:.2f},{s['y']:.2f})"
                    f" heading={s['heading_deg']:.1f}°"
                    f" speed={s['speed']:.0f}"
                    f" lights={'on' if s['lights'] else 'off'}"
                    f" {'running' if s['running'] else 'stopped'}"
                )
            elif reply.get("ok") is False:
                print(f"    ERROR: {reply.get('error')}")
            else:
                keys = {k: v for k, v in reply.items() if k not in ("ok", "command")}
                print(f"    {keys}")

    print("\nDemo complete.")


if __name__ == "__main__":
    asyncio.run(run_demo())
