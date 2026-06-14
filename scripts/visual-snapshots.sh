#!/usr/bin/env bash
#
# Generate or verify Linux visual-regression snapshots.
#
# Linux is the ONLY snapshot baseline — reproducible because:
# - CI (ubuntu-24.04-arm): Playwright runs natively. The runner IS the baseline
#   environment — Ubuntu 24.04 Noble arm64, same packages as the container.
# - Local (macOS Apple Silicon): Playwright runs inside a pinned
#   mcr.microsoft.com/playwright container via Colima arm64, so local baselines
#   match CI byte-for-byte. No more "push, wait for CI to fail, download".
#
# Multi-browser local runs fan out to parallel Docker containers so wall-clock
# time equals the slowest single browser (~2 min) rather than their sum (~6 min).
#
# Usage:
#   npm run snapshots           # regen all 3 browsers in parallel (local, Docker)
#   npm run snapshots:verify    # verify all 3 browsers in parallel (local, Docker)
#   scripts/visual-snapshots.sh --project=chromium --grep=@visual  # CI path (native)
#
# Local requires: Docker + Colima pw profile. CI requires: Node + Playwright browsers
# (installed by setup-deps in the CI job).
set -euo pipefail

cd "$(dirname "$0")/.."

# ── Site build (once, shared across all runners/containers) ──────────────────
# Clean first: dev-server builds use _config_dev.yml (unpublished: true) which
# can leave stale files that diverge from a clean CI build.
echo "▶ Building site (snapshot overlay: assets served locally, not from prod)..."
rm -rf _site/
npm run prebuild:js >/dev/null
npm run build:js >/dev/null
bundle exec jekyll build --quiet --config _config.yml,_config_snapshot.yml

# ── Parse --project= flags out of the remaining args ────────────────────────
PROJECTS=()
OTHER_ARGS=()
for arg in "$@"; do
  if [[ "$arg" == --project=* ]]; then
    PROJECTS+=("${arg#--project=}")
  else
    OTHER_ARGS+=("$arg")
  fi
done

# ── Docker setup ─────────────────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker is required (visual snapshots render in a pinned Playwright container)." >&2
  exit 1
fi

# In CI the runner is already arm64 so use the default Docker context (the
# image is pre-pulled and cached by the CI job before this script runs).
# Locally, target a dedicated arm64 Colima profile to avoid touching a
# differently-configured default engine.
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

# Pin to the EXACT Playwright version so browser build — and pixels — match CI.
PW_VERSION="$(node -p "require('@playwright/test/package.json').version")"
IMAGE="mcr.microsoft.com/playwright:v${PW_VERSION}-noble"

# ── Single browser (or no browser filter): one container ─────────────────────
if [ "${#PROJECTS[@]}" -le 1 ]; then
  echo "▶ Running Playwright in ${IMAGE} (${DOCKER[*]}) ..."
  exec "${DOCKER[@]}" run --rm \
    --platform linux/arm64 \
    -v "$PWD":/work -w /work \
    -e STATIC_SERVE=1 \
    -e "PLAYWRIGHT_WORKERS=${PLAYWRIGHT_WORKERS:-1}" \
    "$IMAGE" \
    npx playwright test -c test-suite/configs/playwright.config.ts \
      ${PROJECTS[0]:+--project="${PROJECTS[0]}"} "${OTHER_ARGS[@]}"
fi

# ── Multiple browsers: fan out to parallel containers ───────────────────────
# Each browser gets its own container (workers=1 per container = deterministic)
# and its own HTML report dir so concurrent writes don't clobber each other.
# Wall-clock = slowest single browser instead of the sum of all browsers.
echo "▶ Fanning out ${#PROJECTS[@]} browsers in parallel: ${PROJECTS[*]}"
echo "  Container: ${IMAGE} via ${DOCKER[*]}"
echo ""

PIDS=()
TMPFILES=()

# Clean up background containers and temp files on exit/interrupt
cleanup() {
  local pid
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
  rm -f "${TMPFILES[@]:-}"
}
trap cleanup EXIT INT TERM

START=$(date +%s)

for browser in "${PROJECTS[@]}"; do
  tmpf=$(mktemp "${TMPDIR:-/tmp}/pw-snapshot-XXXXXX")
  TMPFILES+=("$tmpf")
  "${DOCKER[@]}" run --rm \
    --platform linux/arm64 \
    -v "$PWD":/work -w /work \
    -e STATIC_SERVE=1 \
    -e "PLAYWRIGHT_WORKERS=${PLAYWRIGHT_WORKERS:-1}" \
    -e "PLAYWRIGHT_HTML_REPORT=/work/test-suite/reports/playwright-html-${browser}" \
    "$IMAGE" \
    npx playwright test -c test-suite/configs/playwright.config.ts \
      --project="$browser" "${OTHER_ARGS[@]}" \
    >"$tmpf" 2>&1 &
  PIDS+=($!)
  echo "  • $browser  →  PID ${PIDS[-1]}"
done

echo ""

# Wait for all containers; print each browser's output sequentially
OVERALL=0
for i in "${!PIDS[@]}"; do
  browser="${PROJECTS[$i]}"
  wait "${PIDS[$i]}"
  code=$?
  printf '─%.0s' $(seq 1 60); echo ""
  echo "  [$browser]  exit=$code"
  printf '─%.0s' $(seq 1 60); echo ""
  cat "${TMPFILES[$i]}"
  [ $code -ne 0 ] && OVERALL=$code
done

END=$(date +%s)
ELAPSED=$((END - START))

echo ""
printf '═%.0s' $(seq 1 60); echo ""
if [ $OVERALL -eq 0 ]; then
  echo "  ✅  All browsers passed  (${ELAPSED}s wall-clock)"
else
  echo "  ❌  One or more browsers failed  (${ELAPSED}s, exit $OVERALL)"
fi
printf '═%.0s' $(seq 1 60); echo ""

exit $OVERALL
