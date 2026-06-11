/**
 * Tree-sitter grammar for Remote Car Control DSL
 *
 * Example commands:
 *   move forward 50
 *   move backward 30
 *   turn left 45
 *   turn right 90
 *   set speed 80
 *   stop
 *   brake
 *   lights on
 *   lights off
 *   status
 */
module.exports = grammar({
  name: "car_control",

  extras: ($) => [/\s/],

  rules: {
    source_file: ($) => repeat(seq($.command, /\n?/)),

    command: ($) =>
      choice(
        $.move_command,
        $.turn_command,
        $.set_command,
        $.stop_command,
        $.brake_command,
        $.lights_command,
        $.status_command
      ),

    move_command: ($) =>
      seq(
        "move",
        field("direction", $.move_direction),
        field("distance", $.number)
      ),

    turn_command: ($) =>
      seq(
        "turn",
        field("direction", $.turn_direction),
        field("angle", $.number)
      ),

    set_command: ($) =>
      seq("set", "speed", field("value", $.number)),

    stop_command: (_) => "stop",

    brake_command: (_) => "brake",

    lights_command: ($) =>
      seq("lights", field("state", $.lights_state)),

    status_command: (_) => "status",

    move_direction: (_) => choice("forward", "backward"),

    turn_direction: (_) => choice("left", "right"),

    lights_state: (_) => choice("on", "off"),

    number: (_) => /[0-9]+(\.[0-9]+)?/,
  },
});
