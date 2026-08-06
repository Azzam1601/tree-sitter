# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## ⚠️ Project AI Policy — read first

This project has an **explicit, enforced AI-contribution policy** in
[`docs/src/6-contributing.md`](docs/src/6-contributing.md). Before doing anything
that would touch the upstream repo, note:

1. **No direct coding-agent interaction with the `tree-sitter/tree-sitter` repo.**
   Do not open automated PRs/issues or automated code reviews against upstream. A
   human must be in the driver's seat. LLM-assisted iteration should happen on a
   personal fork first; a clean, human-authored PR is opened afterward.
2. **No copy-pasted LLM output** in issues, PR descriptions, or comments. Keep
   communication concise and human-written.
3. **All AI use must be disclosed**, with a short description of how the tool was
   used and what the contributor did themselves.

When assisting here, act as a tool for a human contributor: make focused changes,
explain them plainly, and let the human own the review and submission. Prefer
small, well-tested diffs that match existing conventions over large rewrites.

## What this project is

Tree-sitter is a **parser generator tool** and an **incremental parsing library**.
It builds a concrete syntax tree for a source file and efficiently updates that
tree as the file is edited. Core goals: general (parse any language), fast (parse
on every keystroke), robust (useful results despite syntax errors), and
dependency-free (the runtime is pure C, embeddable anywhere).

The current workspace version is **0.27.0** (see `Cargo.toml`).

## Repository layout

This is a Cargo **workspace** (Rust) wrapping a pure-C core library, plus web and
other language bindings.

### Core C library — `lib/`
The runtime that gets embedded in applications. Pure C11, no dependencies.

- `lib/src/` — implementation. Key files (by size/importance):
  - `query.c` — the query engine (S-expression pattern matching).
  - `parser.c` — the core LR/GLR parsing algorithm.
  - `wasm_store.c` / `wasm_store.h` — running Wasm-compiled parsers via wasmtime.
  - `subtree.c` — the immutable, ref-counted subtree representation (the CST nodes).
  - `stack.c` — the GLR parse stack.
  - `node.c`, `tree.c`, `tree_cursor.c` — the public tree/node/cursor API surface.
  - `lexer.c`, `language.c`, `get_changed_ranges.c` — lexing, language tables, edit diffing.
  - `alloc.c/.h`, `array.h`, `atomic.h`, `unicode.h`, `portable/` — supporting utilities.
- `lib/include/tree_sitter/api.h` — **the public C API** (~1500 lines). The
  authoritative contract for embedders and bindings. Changes here ripple into
  every binding.
- `lib/src/wasm/` — the Wasm stdlib symbols consumed by Wasm-compiled parsers.
- `lib/binding_rust/` — the `tree-sitter` Rust crate (safe wrapper over the C API):
  `lib.rs`, `ffi.rs` (generated bindings), `build.rs`, `wasm_language.rs`.
- `lib/binding_web/` — the `web-tree-sitter` package (TypeScript wrapper over the
  Wasm build). Source in `lib/binding_web/src/*.ts`; has its own `package.json`,
  ESLint config, and vitest tests.
- `lib/lldb_pretty_printers/` — LLDB pretty printers for C types when debugging.

### Rust crates — `crates/`
Everything except `lib` is under `crates/`. Workspace default member is `crates/cli`.

- `cli/` — the `tree-sitter` command-line tool. **This is the default build
  target.** Subcommands live as modules in `crates/cli/src/` (`generate.rs`,
  `parse.rs`, `test.rs`, `query.rs`, `highlight.rs`, `tags.rs`, `playground.rs`,
  `init.rs`, `wasm.rs`, etc.). Integration tests are in `crates/cli/src/tests/`.
- `generate/` — generates C source from a `grammar.js` grammar (the `generate`
  command's engine). Contains the parse-table builder (`build_tables/`), grammar
  preparation (`prepare_grammar/`), the JS grammar DSL (`dsl.js`), and an embedded
  QuickJS runtime (`quickjs.rs`) so grammars can be evaluated without Node.
- `highlight/` — syntax-highlighting library (`tree-sitter-highlight`).
- `tags/` — code-navigation tag extraction (`tree-sitter-tags`).
- `loader/` — locates, compiles, and dynamically loads grammars at runtime.
- `config/` — user configuration for the CLI (`config.json` handling).
- `language/` — the small shared `Language` type (`tree-sitter-language`),
  depended on by language implementations.
- `xtask/` — the project's task runner (`cargo xtask ...`); see below.

### Other top-level pieces
- `docs/` — the mdBook documentation site (`docs/src/`). Start with
  `docs/src/SUMMARY.md`. Contributing/dev guide is `docs/src/6-contributing.md`.
- `test/fixtures/` — test corpora and grammars fetched/generated for the test suite
  (`grammars/`, `test_grammars/`, `error_corpus/`, `fixtures.json`).
- Build systems: `Cargo.toml` (Rust), `Makefile` + `CMakeLists.txt` (C library),
  `build.zig`/`build.zig.zon` (Zig), `Package.swift` (Swift), `flake.nix` (Nix).

## Build & development workflows

### Prerequisites
- A C/C++ compiler (for the core library and generated parsers).
- A Rust toolchain (**MSRV 1.90**, edition 2024) for the crates and CLI.
- Node.js + npm (needed by `tree-sitter generate` to evaluate `grammar.js`, and to
  build/lint the web binding).
- Emscripten, Docker, or Podman for compiling the library to Wasm (optional).

### Building
```sh
cargo build --release              # builds the CLI into target/release/tree-sitter
cargo install --path crates/cli    # install the CLI system-wide
cargo build --profile release-dev  # faster iteration builds (debug asserts on)
```
Custom Cargo profiles are defined in `Cargo.toml`: `optimize` and `size` (LTO,
stripped release variants) and `release-dev` (fast, with debug assertions and
overflow checks).

The C library alone builds via `make` (produces `libtree-sitter.a`,
`libtree-sitter.$(SOEXT)`, and `tree-sitter.pc`) or via CMake.

### The `xtask` runner
Project automation is exposed through `cargo xtask <command>` (implemented in
`crates/xtask`). Run `cargo xtask --help` to list all. Common ones:
- `fetch-fixtures` — fetch upstream grammars used by the test suite.
- `generate-fixtures [--wasm]` — regenerate those parsers with the current CLI.
- `test` / `test-wasm` — run the Rust / Wasm test suites.
- `build-wasm` / `build-wasm-stdlib` — compile the Wasm library and its stdlib.
- `benchmark`, `bump-version`, `generate-bindings`, `check-wasm-exports`.

### Testing
```sh
cargo xtask fetch-fixtures      # one-time: fetch upstream test grammars
cargo xtask generate-fixtures   # regenerate parsers with your CLI changes
cargo xtask test                # run the suite
```
Useful test flags (see `cargo xtask test -h`):
- Positional arg filters by test name: `cargo xtask test test_name_substr`.
- `-g` runs under a debugger (lldb/gdb).
- `-l <language>` / `-e <example>` limit corpus tests to one language/example,
  e.g. `cargo xtask test -l javascript -e Arrays`.

Wasm: `cargo xtask generate-fixtures --wasm && cargo xtask test-wasm`.

Sanitizers (for the C core / parsers):
```sh
CFLAGS=-fsanitize=address RUSTFLAGS="-lasan --cfg sanitizing" \
  ASAN_OPTIONS=verify_asan_link_order=0 cargo test
```
Swap `address`→`undefined` and `-lasan`→`-lubsan` for UBSAN.

### Linting & formatting (run before proposing changes)
`make lint` runs:
```sh
cargo update --workspace --locked --quiet
cargo fmt --all --check
cargo clippy --workspace --all-targets -- -D warnings
```
`make format` applies `cargo fmt --all`. `make lint-web` lints the web binding
(`npm --prefix lib/binding_web ci && npm ... run lint`).

**Clippy is strict.** `Cargo.toml` enables `pedantic`, `nursery`, and `cargo`
lint groups at warn, denies `dbg_macro` and `todo`, and CI treats warnings as
errors (`-D warnings`). A curated allow-list of specific lints is in
`[workspace.lints.clippy]` — respect it rather than adding new `#[allow(...)]`.

## CLI overview

The `tree-sitter` CLI subcommands (from `crates/cli/src/main.rs`):
`init-config`, `init`, `generate`, `build`, `parse`, `test`, `version`, `fuzz`,
`query`, `highlight`, `tags`, `playground`, `dump-languages`, `complete`.
(`parse`/`test` compile the parser as needed; `build` produces a shared lib or
Wasm module.) Each has its own module in `crates/cli/src/`.

## Conventions & house style

- **Rust**: edition 2024, MSRV 1.90. Format with `cargo fmt` (config in
  `.editorconfig`/rustfmt defaults); pass `cargo clippy` with the workspace lint
  config clean. Do not introduce `dbg!` or `todo!` — they are denied.
- **C**: C11, compiled with `-Wall -Wextra -Wshadow -Wpedantic` and several
  `-Werror=` flags plus strict aliasing (see `Makefile`). Symbols are hidden by
  default (`-fvisibility=hidden`); only the `api.h` surface is exported. Keep the
  core dependency-free.
- **Public API stability**: `lib/include/tree_sitter/api.h` is a contract. A change
  there generally requires matching updates in the Rust (`lib/binding_rust`) and
  web (`lib/binding_web`) bindings, and possibly regenerated `ffi.rs`
  (`cargo xtask generate-bindings`) and Wasm exports (`cargo xtask check-wasm-exports`).
- **TOML** formatting is governed by `.taplo.toml`.
- **Grammars for tests** are generated code — do not hand-edit generated `parser.c`
  files under fixtures; regenerate via xtask.

## CI

CI (`.github/workflows/ci.yml`) runs on push and PR:
- `checks` — `make lint` and `make lint-web` (fmt, clippy `-D warnings`, web lint).
- `sanitize` — ASAN/UBSAN suite (`sanitize.yml`).
- `build` — multi-platform build/test matrix (`build.yml`).
- `check-wasm-stdlib` — verifies the Wasm stdlib is in sync (`wasm_stdlib.yml`).

Match these locally before proposing changes: `make lint && cargo xtask test`.
Note that changes under `crates/language/wasm/**` require rebuilding the Wasm
stdlib (`cargo xtask build-wasm-stdlib`), and changes to Wasm exports must keep
`cargo xtask check-wasm-exports` passing.

## Where to look for more

- User & developer docs: `docs/src/` (rendered at https://tree-sitter.github.io).
- Creating grammars: `docs/src/creating-parsers/`.
- Using parsers / bindings: `docs/src/using-parsers/`, `lib/binding_rust/README.md`,
  `lib/binding_web/README.md`, `crates/cli/README.md`.
- Contributing & full dev guide: `docs/src/6-contributing.md`.
