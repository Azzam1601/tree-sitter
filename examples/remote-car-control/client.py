#!/usr/bin/env python3
"""
Remote Car Control Client

Interactive command-line client for controlling a car over WebSocket.
Run: python client.py [--host HOST] [--port PORT]

Available commands:
  move forward <distance>   - Drive forward N units
  move backward <distance>  - Drive backward N units
  turn left <angle>         - Turn left by angle degrees
  turn right <angle>        - Turn right by angle degrees
  set speed <0-100>         - Set current speed
  stop                      - Stop the car
  brake                     - Reduce speed by 20
  lights on|off             - Toggle headlights
  status                    - Show current car state
  quit / exit               - Disconnect
"""

import asyncio
import json
import argparse
import sys
import logging

import websockets

logging.basicConfig(level=logging.WARNING)
log = logging.getLogger("car-client")

BANNER = """
╔═══════════════════════════════════════╗
║    Remote Car Control Client v1.0     ║
╠═══════════════════════════════════════╣
║  Commands:                            ║
║   move forward/backward <dist>        ║
║   turn left/right <angle>             ║
║   set speed <0-100>                   ║
║   stop | brake                        ║
║   lights on|off                       ║
║   status                              ║
║   quit                                ║
╚═══════════════════════════════════════╝
"""


def _fmt_state(state: dict) -> str:
    lights = "ON" if state.get("lights") else "OFF"
    running = "running" if state.get("running") else "stopped"
    return (
        f"  Position : ({state['x']:.2f}, {state['y']:.2f})\n"
        f"  Heading  : {state['heading_deg']:.1f}°\n"
        f"  Speed    : {state['speed']:.0f}/100\n"
        f"  Lights   : {lights}\n"
        f"  Status   : {running}"
    )


async def receive_loop(ws):
    """Print incoming server messages."""
    async for raw in ws:
        msg = json.loads(raw)
        event = msg.get("event")

        if event == "welcome":
            print(f"\n[Server] {msg['message']}")
            print("[Car State]\n" + _fmt_state(msg["state"]))
        elif event == "state_update":
            pass  # suppress background broadcasts for cleaner output
        elif msg.get("ok") is False:
            print(f"[Error] {msg.get('error', 'Unknown error')}")
        elif msg.get("ok") is True:
            if "state" in msg:
                print("[Car State]\n" + _fmt_state(msg["state"]))
            elif "message" in msg:
                print(f"[OK] {msg['message']}")
            elif "moved" in msg:
                print(f"[OK] Moved {msg['direction']} {msg['moved']} units")
            elif "turned" in msg:
                print(f"[OK] Turned {msg['direction']} {msg['turned']}°")
            elif "speed" in msg:
                print(f"[OK] Speed set to {msg['speed']:.0f}")
            elif "lights" in msg:
                state = "on" if msg["lights"] else "off"
                print(f"[OK] Lights {state}")
            else:
                print(f"[OK] {msg}")


async def send_loop(ws):
    """Read commands from stdin and send them."""
    loop = asyncio.get_event_loop()
    while True:
        try:
            line = await loop.run_in_executor(None, sys.stdin.readline)
        except (EOFError, KeyboardInterrupt):
            break

        line = line.strip()
        if not line:
            continue
        if line.lower() in ("quit", "exit", "q"):
            print("Disconnecting…")
            break

        await ws.send(line)


async def main(host: str, port: int):
    uri = f"ws://{host}:{port}"
    print(BANNER)
    print(f"Connecting to {uri} …", end=" ", flush=True)
    try:
        async with websockets.connect(uri) as ws:
            print("connected.\n")
            recv_task = asyncio.create_task(receive_loop(ws))
            send_task = asyncio.create_task(send_loop(ws))
            done, pending = await asyncio.wait(
                [recv_task, send_task],
                return_when=asyncio.FIRST_COMPLETED,
            )
            for task in pending:
                task.cancel()
    except OSError as exc:
        print(f"failed.\nCannot connect to {uri}: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Remote Car Control Client")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    try:
        asyncio.run(main(args.host, args.port))
    except KeyboardInterrupt:
        print("\nBye!")
