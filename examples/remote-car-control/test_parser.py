"""Unit tests for the car command parser."""

import pytest
from car_command_parser import parse_command, parse_script, CarCommand, ParseError


def test_move_forward():
    cmd = parse_command("move forward 50")
    assert cmd == CarCommand("move", {"direction": "forward", "distance": 50.0})


def test_move_backward():
    cmd = parse_command("move backward 30.5")
    assert cmd == CarCommand("move", {"direction": "backward", "distance": 30.5})


def test_turn_left():
    cmd = parse_command("turn left 90")
    assert cmd == CarCommand("turn", {"direction": "left", "angle": 90.0})


def test_turn_right():
    cmd = parse_command("turn right 45")
    assert cmd == CarCommand("turn", {"direction": "right", "angle": 45.0})


def test_set_speed():
    cmd = parse_command("set speed 75")
    assert cmd == CarCommand("set_speed", {"value": 75.0})


def test_stop():
    cmd = parse_command("stop")
    assert cmd == CarCommand("stop", {})


def test_brake():
    cmd = parse_command("brake")
    assert cmd == CarCommand("brake", {})


def test_lights_on():
    cmd = parse_command("lights on")
    assert cmd == CarCommand("lights", {"state": "on"})


def test_lights_off():
    cmd = parse_command("lights off")
    assert cmd == CarCommand("lights", {"state": "off"})


def test_status():
    cmd = parse_command("status")
    assert cmd == CarCommand("status", {})


def test_case_insensitive():
    cmd = parse_command("MOVE FORWARD 10")
    assert cmd == CarCommand("move", {"direction": "forward", "distance": 10.0})


def test_empty_line_returns_none():
    assert parse_command("") is None
    assert parse_command("   ") is None


def test_comment_returns_none():
    assert parse_command("# this is a comment") is None


def test_unknown_command_raises():
    with pytest.raises(ParseError):
        parse_command("fly up 100")


def test_parse_script():
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
    assert cmds[1] == CarCommand("turn", {"direction": "right", "angle": 90.0})
    assert cmds[5] == CarCommand("status", {})


def test_parse_script_error_reports_line():
    with pytest.raises(ParseError, match="Line 2"):
        parse_script("move forward 10\nbad command\nstop")
