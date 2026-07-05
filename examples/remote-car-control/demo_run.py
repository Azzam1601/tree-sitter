#!/usr/bin/env python3
"""
Non-interactive demo for MOR Remote Car Control.
Sends a scripted sequence (English and Arabic commands) and prints results.
"""

import asyncio
import json
import websockets

SCRIPT = [
    # English commands
    "status",
    "lights on",
    "set speed 80",
    "move forward 100",
    "turn right 90",
    "move forward 50",
    "turn left 45",
    "move backward 20",
    # Arabic commands (أوامر عربية)
    "سرعة 30",
    "فرامل",
    "أضواء إيقاف",
    "توقف",
    "تشغيل",
    "إعادة",
    "حالة",
]


async def run_demo(host="localhost", port=8765):
    uri = f"ws://{host}:{port}"
    print(f"Connecting to {uri}…")
    async with websockets.connect(uri) as ws:
        welcome = json.loads(await ws.recv())
        print(f"[Server] {welcome['message']}\n")

        for cmd in SCRIPT:
            print(f">>> {cmd}")
            await ws.send(cmd)

            reply = json.loads(await ws.recv())
            # Skip a stray broadcast from the previous command
            if reply.get("event") == "state_update":
                reply = json.loads(await ws.recv())

            if "state" in reply:
                s = reply["state"]
                print(
                    f"    pos=({s['x']:.2f},{s['y']:.2f})"
                    f"  heading={s['heading']:.1f}°"
                    f"  speed={s['speed']:.0f}"
                    f"  lights={'on' if s['lights'] else 'off'}"
                    f"  {'running' if s['running'] else 'stopped'}"
                )
            elif reply.get("ok") is False:
                print(f"    ERROR: {reply.get('error')}")
            else:
                detail = {k: v for k, v in reply.items() if k not in ("ok", "command")}
                print(f"    {detail}")

    print("\nDemo complete.")


if __name__ == "__main__":
    asyncio.run(run_demo())
