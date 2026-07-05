/**
 * Tree-sitter grammar for Remote Car Control DSL
 * MOR Services Company | شركة مور للخدمات
 *
 * English examples:
 *   move forward 50        move backward 30
 *   turn left 45           turn right 90
 *   set speed 80
 *   stop  start  reset  brake
 *   lights on              lights off
 *   status
 *
 * Arabic aliases (أوامر عربية):
 *   تقدم 50                تراجع 30
 *   يسار 45                يمين 90
 *   سرعة 80
 *   توقف  تشغيل  إعادة  فرامل
 *   أضواء تشغيل            أضواء إيقاف
 *   حالة
 */
module.exports = grammar({
  name: "car_control",

  extras: ($) => [/\s/],

  rules: {
    source_file: ($) => repeat($.command),

    command: ($) =>
      choice(
        $.move_command,
        $.turn_command,
        $.set_command,
        $.stop_command,
        $.start_command,
        $.reset_command,
        $.brake_command,
        $.lights_command,
        $.status_command,
        $.arabic_move_command,
        $.arabic_turn_command,
        $.arabic_set_speed_command,
        $.arabic_stop_command,
        $.arabic_start_command,
        $.arabic_reset_command,
        $.arabic_brake_command,
        $.arabic_lights_command,
        $.arabic_status_command
      ),

    // ── English commands ──────────────────────────────
    move_command: ($) =>
      seq("move", field("direction", $.move_direction), field("distance", $.number)),

    turn_command: ($) =>
      seq("turn", field("direction", $.turn_direction), field("angle", $.number)),

    set_command: ($) =>
      seq("set", "speed", field("value", $.number)),

    stop_command:  (_) => "stop",
    start_command: (_) => "start",
    reset_command: (_) => "reset",
    brake_command: (_) => "brake",

    lights_command: ($) =>
      seq("lights", field("state", $.lights_state)),

    status_command: (_) => "status",

    move_direction:  (_) => choice("forward", "backward"),
    turn_direction:  (_) => choice("left", "right"),
    lights_state:    (_) => choice("on", "off"),

    // ── Arabic commands ───────────────────────────────
    arabic_move_command: ($) =>
      seq(field("direction", $.arabic_move_direction), field("distance", $.number)),

    arabic_turn_command: ($) =>
      seq(field("direction", $.arabic_turn_direction), field("angle", $.number)),

    arabic_set_speed_command: ($) =>
      seq("سرعة", field("value", $.number)),

    arabic_stop_command:  (_) => "توقف",
    arabic_start_command: (_) => "تشغيل",
    arabic_reset_command: (_) => "إعادة",
    arabic_brake_command: (_) => "فرامل",

    arabic_lights_command: ($) =>
      seq("أضواء", field("state", $.arabic_lights_state)),

    arabic_status_command: (_) => "حالة",

    arabic_move_direction: (_) => choice("تقدم", "تراجع"),
    arabic_turn_direction:  (_) => choice("يمين", "يسار"),
    arabic_lights_state:    (_) => choice("تشغيل", "إيقاف"),

    // ── Shared ────────────────────────────────────────
    number: (_) => /[0-9]+(\.[0-9]+)?/,
  },
});
