"""
Car command parser - parses the Remote Car Control DSL.

English commands:
  move forward <distance>     / move backward <distance>
  turn left <angle>           / turn right <angle>
  set speed <value>
  stop | start | reset | brake
  lights on | lights off
  status

Arabic aliases (أوامر عربية):
  تقدم <distance>    / تراجع <distance>
  يمين <angle>       / يسار <angle>
  سرعة <value>
  توقف | تشغيل | إعادة | فرامل
  أضواء تشغيل | أضواء إيقاف
  حالة
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
    # English: move
    (
        r"move\s+(forward|backward)\s+(\d+(?:\.\d+)?)",
        lambda m: CarCommand("move", {"direction": m.group(1).lower(), "distance": float(m.group(2))}),
    ),
    # Arabic: تقدم / تراجع
    (
        r"(تقدم|تراجع)\s+(\d+(?:\.\d+)?)",
        lambda m: CarCommand("move", {
            "direction": "forward" if m.group(1) == "تقدم" else "backward",
            "distance": float(m.group(2)),
        }),
    ),
    # English: turn
    (
        r"turn\s+(left|right)\s+(\d+(?:\.\d+)?)",
        lambda m: CarCommand("turn", {"direction": m.group(1).lower(), "angle": float(m.group(2))}),
    ),
    # Arabic: يمين / يسار
    (
        r"(يمين|يسار)\s+(\d+(?:\.\d+)?)",
        lambda m: CarCommand("turn", {
            "direction": "right" if m.group(1) == "يمين" else "left",
            "angle": float(m.group(2)),
        }),
    ),
    # English: set speed
    (
        r"set\s+speed\s+(\d+(?:\.\d+)?)",
        lambda m: CarCommand("set_speed", {"value": float(m.group(1))}),
    ),
    # Arabic: سرعة
    (
        r"سرعة\s+(\d+(?:\.\d+)?)",
        lambda m: CarCommand("set_speed", {"value": float(m.group(1))}),
    ),
    # English: stop / start / reset / brake
    (r"stop\s*$",  lambda m: CarCommand("stop",  {})),
    (r"start\s*$", lambda m: CarCommand("start", {})),
    (r"reset\s*$", lambda m: CarCommand("reset", {})),
    (r"brake\s*$", lambda m: CarCommand("brake", {})),
    # Arabic: توقف / تشغيل / إعادة / فرامل
    (r"توقف\s*$",  lambda m: CarCommand("stop",  {})),
    (r"تشغيل\s*$", lambda m: CarCommand("start", {})),
    (r"إعادة\s*$", lambda m: CarCommand("reset", {})),
    (r"فرامل\s*$", lambda m: CarCommand("brake", {})),
    # English: lights on/off
    (r"lights\s+(on|off)", lambda m: CarCommand("lights", {"state": m.group(1).lower()})),
    # Arabic: أضواء تشغيل / أضواء إيقاف
    (r"أضواء\s+(تشغيل|إيقاف)", lambda m: CarCommand("lights", {
        "state": "on" if m.group(1) == "تشغيل" else "off",
    })),
    # English / Arabic: status / حالة
    (r"status\s*$", lambda m: CarCommand("status", {})),
    (r"حالة\s*$",   lambda m: CarCommand("status", {})),
]

_COMPILED = [(re.compile(pat, re.IGNORECASE), fn) for pat, fn in _RULES]


def parse_command(text: str) -> Optional[CarCommand]:
    """Parse a single car control command string (English or Arabic)."""
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
