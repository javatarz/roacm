#!/usr/bin/env bash
#
# Generate or verify Linux visual-regression snapshots.
#
# Linux is the ONLY snapshot baseline — it's the build we deploy, and it's the
# one platform we can reproduce byte-for-byte both locally and in CI by running
# Playwright inside a pinned container. This script IS that reproducible path:
# the dev, the pre-push hook, and CI all call it, so locally-generated baselines
# match CI exactly. No more "push, wait for CI to fail, download snapshots".
#
# Usage:
#   scripts/visual-snapshots.sh [playwright args...]
#
#   # Regenerate baselines for the CI browsers (the common case):
#   npm run snapshots
#
#   # Verify only (what CI does), one browser:
#   scripts/visual-snapshots.sh --project=chromium
#
# Requires: Docker, Ruby/Jekyll, Node (all already used by this repo).
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker is required (visual snapshots render in a pinned Playwright container)." >&2
  exit 1
fi

# Snapshots are arm64 (CI runs on ubuntu-24.04-arm; see ci.yml). Locally we need
# a NATIVE arm64 Docker engine — emulating arm64 on an x86_64 VM is slow and can
# drift. Target a dedicated arm64 Colima profile by its Docker context so a
# differently-configured default engine is left untouched. In CI the runner is
# already arm64, so use the default context there.
DOCKER=(docker)
if [ -z "${CI:-}" ]; then
  CTX="${SNAPSHOT_DOCKER_CONTEXT:-colima-pw}"
  if ! docker context inspect "$CTX" >/dev/null 2>&1; then
    echo "❌ Docker context '$CTX' not found." >&2
    echo "   One-time setup of a native arm64 engine for snapshots:" >&2
    echo "     colima start --profile pw --arch aarch64 --cpu 4 --memory 6" >&2
    echo "   (or point SNAPSHOT_DOCKER_CONTEXT at any native arm64 Docker context)" >&2
    exit 1
  fi
  DOCKER=(docker --context "$CTX")
fi

# Pin the container to the EXACT Playwright version in node_modules so the
# browser build — and therefore the pixels — match CI. -noble matches the
# ubuntu-24.04-arm GitHub runner.
PW_VERSION="$(node -p "require('@playwright/test/package.json').version")"
IMAGE="mcr.microsoft.com/playwright:v${PW_VERSION}-noble"

echo "▶ Building site (snapshot overlay: assets served locally, not from prod)..."
npm run prebuild:js >/dev/null
npm run build:js >/dev/null
bundle exec jekyll build --quiet --config _config.yml,_config_snapshot.yml

echo "▶ Running Playwright in ${IMAGE} (${DOCKER[*]}) ..."
# --platform linux/arm64: pixels must match the arm64 CI runner. Native on an
# arm64 engine (fast); explicit so the right image is always pulled.
exec "${DOCKER[@]}" run --rm \
  --platform linux/arm64 \
  -v "$PWD":/work -w /work \
  -e STATIC_SERVE=1 \
  "$IMAGE" \
  npx playwright test -c test-suite/configs/playwright.config.ts "$@"
