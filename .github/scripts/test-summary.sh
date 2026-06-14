#!/usr/bin/env bash
# Requires: THEME_CHANGED, VALIDATE_RESULT, LINT_RESULT, VISUAL_RESULT,
#           FUNCTIONAL_RESULT, PERF_RESULT, DEPLOY_RESULT, SMOKE_RESULT env vars
set -euo pipefail

echo "Theme changes detected: ${THEME_CHANGED}"
echo ""

if [[ "${VALIDATE_RESULT}" != "success" ]]; then
  echo "❌ HTML validation failed. Deployment was blocked."
  echo "  - HTML validation: ${VALIDATE_RESULT}"
  exit 1
fi

if [[ "${THEME_CHANGED}" == "false" ]]; then
  echo "✅ No theme changes - theme tests skipped, HTML validation passed, build/deploy proceeded"
  exit 0
fi

if [[ "${LINT_RESULT}" != "success" || \
      "${VISUAL_RESULT}" != "success" || \
      "${FUNCTIONAL_RESULT}" != "success" || \
      "${PERF_RESULT}" != "success" ]]; then
  echo "❌ Some tests failed. Deployment was blocked."
  echo "  - Lint: ${LINT_RESULT}"
  echo "  - Visual: ${VISUAL_RESULT}"
  echo "  - Functional E2E (includes a11y): ${FUNCTIONAL_RESULT}"
  echo "  - Perf (includes Lighthouse thresholds): ${PERF_RESULT}"
  exit 1
fi

if [[ "${DEPLOY_RESULT}" != "success" ]]; then
  echo "❌ Build/deploy failed."
  exit 1
fi

if [[ "${SMOKE_RESULT}" == "failure" ]]; then
  echo "❌ Smoke test failed after deploy — site auto-rolled back. Investigate this commit."
  exit 1
fi

echo "✅ All tests passed (including Lighthouse thresholds) and deployment succeeded!"
