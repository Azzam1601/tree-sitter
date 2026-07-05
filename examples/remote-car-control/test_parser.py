"""Unit tests for the car command parser (English + Arabic)."""

import pytest
from car_command_parser import parse_command, parse_script, CarCommand, ParseError


# ── English commands ──────────────────────────────────────────────────────────

def test_move_forward():
    assert parse_command("move forward 50") == CarCommand("move", {"direction": "forward", "distance": 50.0})

def test_move_backward():
    assert parse_command("move backward 30.5") == CarCommand("move", {"direction": "backward", "distance": 30.5})

def test_turn_left():
    assert parse_command("turn left 90") == CarCommand("turn", {"direction": "left", "angle": 90.0})

def test_turn_right():
    assert parse_command("turn right 45") == CarCommand("turn", {"direction": "right", "angle": 45.0})

def test_set_speed():
    assert parse_command("set speed 75") == CarCommand("set_speed", {"value": 75.0})

def test_stop():
    assert parse_command("stop") == CarCommand("stop", {})

def test_start():
    assert parse_command("start") == CarCommand("start", {})

def test_reset():
    assert parse_command("reset") == CarCommand("reset", {})

def test_brake():
    assert parse_command("brake") == CarCommand("brake", {})

def test_lights_on():
    assert parse_command("lights on") == CarCommand("lights", {"state": "on"})

def test_lights_off():
    assert parse_command("lights off") == CarCommand("lights", {"state": "off"})

def test_status():
    assert parse_command("status") == CarCommand("status", {})

def test_case_insensitive():
    assert parse_command("MOVE FORWARD 10") == CarCommand("move", {"direction": "forward", "distance": 10.0})


# ── Arabic commands ───────────────────────────────────────────────────────────

def test_arabic_forward():
    assert parse_command("تقدم 100") == CarCommand("move", {"direction": "forward", "distance": 100.0})

def test_arabic_backward():
    assert parse_command("تراجع 30") == CarCommand("move", {"direction": "backward", "distance": 30.0})

def test_arabic_turn_right():
    assert parse_command("يمين 90") == CarCommand("turn", {"direction": "right", "angle": 90.0})

def test_arabic_turn_left():
    assert parse_command("يسار 45") == CarCommand("turn", {"direction": "left", "angle": 45.0})

def test_arabic_set_speed():
    assert parse_command("سرعة 80") == CarCommand("set_speed", {"value": 80.0})

def test_arabic_stop():
    assert parse_command("توقف") == CarCommand("stop", {})

def test_arabic_start():
    assert parse_command("تشغيل") == CarCommand("start", {})

def test_arabic_reset():
    assert parse_command("إعادة") == CarCommand("reset", {})

def test_arabic_brake():
    assert parse_command("فرامل") == CarCommand("brake", {})

def test_arabic_lights_on():
    assert parse_command("أضواء تشغيل") == CarCommand("lights", {"state": "on"})

def test_arabic_lights_off():
    assert parse_command("أضواء إيقاف") == CarCommand("lights", {"state": "off"})

def test_arabic_status():
    assert parse_command("حالة") == CarCommand("status", {})


# ── Edge cases ────────────────────────────────────────────────────────────────

def test_empty_line_returns_none():
    assert parse_command("") is None
    assert parse_command("   ") is None

def test_comment_returns_none():
    assert parse_command("# this is a comment") is None

def test_unknown_command_raises():
    with pytest.raises(ParseError):
        parse_command("fly up 100")

def test_decimal_distance():
    assert parse_command("move forward 12.5") == CarCommand("move", {"direction": "forward", "distance": 12.5})

def test_decimal_arabic():
    assert parse_command("تقدم 7.3") == CarCommand("move", {"direction": "forward", "distance": 7.3})


# ── Script parsing ────────────────────────────────────────────────────────────

def test_parse_script_english():
    script = """
# Drive forward then turn right
move forward 100
turn right 90
move forward 50
set speed 80
lights on
status
"""
    cmds = parse_script(script)
    assert len(cmds) == 6
    assert cmds[0] == CarCommand("move", {"direction": "forward", "distance": 100.0})
    assert cmds[-1] == CarCommand("status", {})

def test_parse_script_arabic():
    script = """
# القيادة للأمام ثم اليمين
تقدم 100
يمين 90
سرعة 80
أضواء تشغيل
حالة
"""
    cmds = parse_script(script)
    assert len(cmds) == 5
    assert cmds[0] == CarCommand("move", {"direction": "forward", "distance": 100.0})
    assert cmds[2] == CarCommand("set_speed", {"value": 80.0})

def test_parse_script_mixed():
    script = "move forward 10\nتراجع 5\nstop\nتشغيل\nreset"
    cmds = parse_script(script)
    assert len(cmds) == 5
    assert cmds[2] == CarCommand("stop", {})
    assert cmds[3] == CarCommand("start", {})
    assert cmds[4] == CarCommand("reset", {})

def test_parse_script_error_reports_line():
    with pytest.raises(ParseError, match="Line 2"):
        parse_script("move forward 10\nbad command\nstop")
