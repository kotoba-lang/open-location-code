#!/bin/bash
# Compile the Kotoba Open Location Code binding and run vendored fixtures.
# Must run from within the kotoba directory.
if [ "$(basename "$PWD")" != "kotoba" ]; then
  echo "$0: must be run from within the kotoba directory!"
  exit 1
fi

set -euo pipefail

KOTOBA_BIN="${KOTOBA:-kotoba}"
OUT="${TMPDIR:-/tmp}/openlocationcode.wasm"

"$KOTOBA_BIN" compile openlocationcode.kotoba --target wasm --output "$OUT" --json
node run_wasm.mjs "$OUT"
