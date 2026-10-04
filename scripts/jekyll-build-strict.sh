#!/usr/bin/env bash
# Run `jekyll build` and fail if Liquid reports a warning or error. Jekyll exits 0
# on Liquid warnings (e.g. invalid syntax that lax mode papers over), so a
# template defect can ship unnoticed. Extra arguments go to `jekyll build`.
set -o pipefail

LOG=$(mktemp)
trap 'rm -f "$LOG"' EXIT

bundle exec jekyll build "$@" 2>&1 | tee "$LOG"
status=$?
if [ "$status" -ne 0 ]; then
  exit "$status"
fi

# Strip ANSI colors before matching
if sed $'s/\x1b\\[[0-9;]*m//g' "$LOG" | grep -E "Liquid (Warning|Exception|error)"; then
  echo "❌ Jekyll build emitted Liquid warnings/errors (see above)."
  exit 1
fi
