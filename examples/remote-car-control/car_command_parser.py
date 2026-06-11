"""
Car command parser - parses the Remote Car Control DSL.

Commands supported:
  move forward <distance>
  move backward <distance>
  turn left <angle>
  turn right <angle>
  set speed <value>
  stop
  brake
  lights on
  lights off
  status
"""

import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class CarCommand:
    type: str
    params: dict


class ParseError(ValueError):
    pass


_RULES = [
    (
        r"move\s+(forward|backward)\s+(\d+(?:\.\d+)?)",
        lambda m: CarCommand("move", {"direction": m.group(1).lower(), "distance": float(m.group(2))}),
    ),
    (
        r"turn\s+(left|right)\s+(\d+(?:\.\d+)?)",
        lambda m: CarCommand("turn", {"direction": m.group(1).lower(), "angle": float(m.group(2))}),
    ),
    (
        r"set\s+speed\s+(\d+(?:\.\d+)?)",
        lambda m: CarCommand("set_speed", {"value": float(m.group(1))}),
    ),
    (r"stop\s*$", lambda m: CarCommand("stop", {})),
    (r"brake\s*$", lambda m: CarCommand("brake", {})),
    (r"lights\s+(on|off)", lambda m: CarCommand("lights", {"state": m.group(1).lower()})),
    (r"status\s*$", lambda m: CarCommand("status", {})),
]

_COMPILED = [(re.compile(pat, re.IGNORECASE), fn) for pat, fn in _RULES]


def parse_command(text: str) -> Optional[CarCommand]:
    """Parse a single car control command string."""
    text = text.strip()
    if not text or text.startswith("#"):
        return None

    for pattern, builder in _COMPILED:
        m = pattern.fullmatch(text)
        if m:
            return builder(m)

    raise ParseError(f"Unknown command: {text!r}")


def parse_script(text: str) -> list[CarCommand]:
    """Parse a multi-line script of car control commands."""
    commands = []
    for lineno, line in enumerate(text.splitlines(), start=1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        try:
            cmd = parse_command(line)
            if cmd:
                commands.append(cmd)
        except ParseError as exc:
            raise ParseError(f"Line {lineno}: {exc}") from exc
    return commands
