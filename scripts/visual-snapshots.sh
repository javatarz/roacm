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
# Multi-browser invocations (npm run snapshots / npm run snapshots:verify) fan
# out to parallel Docker containers — one per browser — so wall-clock time equals
# the slowest single browser (~2 min) rather than their sum (~6 min). Single-browser
# calls (what CI does per matrix job) run a single container as before.
#
# Usage:
#   npm run snapshots           # regen all 3 browsers in parallel
#   npm run snapshots:verify    # verify all 3 browsers in parallel
#   scripts/visual-snapshots.sh --project=chromium              # one browser (CI path)
#   scripts/visual-snapshots.sh --project=chromium --project=webkit  # two in parallel
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

# ── Site build (once, shared across all browser containers) ─────────────────
echo "▶ Building site (snapshot overlay: assets served locally, not from prod)..."
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

# ── Local runs: default to @visual only (fast baseline regen) ───────────────
# CI runs all tests — functional E2E tests have no other home in the pipeline.
# Callers can always override with an explicit --grep=X.
if [ -z "${CI:-}" ] && ! printf '%s\n' "${OTHER_ARGS[@]:-}" | grep -q '^--grep'; then
  OTHER_ARGS+=("--grep=@visual")
fi

# ── Single browser (or no browser filter): run one container ────────────────
if [ "${#PROJECTS[@]}" -le 1 ]; then
  echo "▶ Running Playwright in ${IMAGE} (${DOCKER[*]}) ..."
  # --platform linux/arm64: pixels must match the arm64 CI runner. Native on an
  # arm64 engine (fast); explicit so the right image is always pulled.
  exec "${DOCKER[@]}" run --rm \
    --platform linux/arm64 \
    -v "$PWD":/work -w /work \
    -e STATIC_SERVE=1 \
    -e "PLAYWRIGHT_WORKERS=${PLAYWRIGHT_WORKERS:-1}" \
    "$IMAGE" \
    npx playwright test -c test-suite/configs/playwright.config.ts "$@"
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
