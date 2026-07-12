#!/usr/bin/env bash
# Requires: THEME_CHANGED, VALIDATE_RESULT, LINT_RESULT, VISUAL_RESULT,
#           FUNCTIONAL_RESULT, IMAGE_OVERFLOW_RESULT, PERF_RESULT,
#           DEPLOY_RESULT, SMOKE_RESULT env vars
set -euo pipefail

echo "Theme changes detected: ${THEME_CHANGED}"
echo ""

# Retry visibility (observability only — never gates the pipeline). Playwright's
# JSON reporter records a `results` entry per attempt; a test with more than one
# result that ultimately passed was masked by a retry (#310).
report_dir="${PLAYWRIGHT_JSON_DIR:-}"
if [[ -n "${report_dir}" && -d "${report_dir}" ]]; then
  retried_count=0
  while IFS= read -r -d '' report; do
    job_label=$(basename "$(dirname "${report}")")
    job_label=${job_label#playwright-json-}
    while IFS=$'\t' read -r project title retries; do
      [[ -z "${project}" ]] && continue
      retried_count=$((retried_count + 1))
      echo "::warning::${job_label} [${project}] ${title} — passed after ${retries} retry(ies)"
    done < <(jq -r '
      [.. | objects | select(has("specs")) | .specs[] as $spec |
        ($spec.tests // [])[] |
        select((.results | length) > 1) |
        select(.results[-1].status == "passed") |
        [.projectName, $spec.title, (.results[-1].retry | tostring)] | @tsv
      ][]
    ' "${report}")
  done < <(find "${report_dir}" -name 'playwright.json' -print0)
  echo "Retried-but-passed tests this run: ${retried_count}"
else
  echo "No Playwright JSON reports available — retry visibility skipped"
fi
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
      "${IMAGE_OVERFLOW_RESULT}" != "success" || \
      "${PERF_RESULT}" != "success" ]]; then
  echo "❌ Some tests failed. Deployment was blocked."
  echo "  - Lint: ${LINT_RESULT}"
  echo "  - Visual: ${VISUAL_RESULT}"
  echo "  - Functional E2E (includes a11y): ${FUNCTIONAL_RESULT}"
  echo "  - Image overflow (mobile-chrome): ${IMAGE_OVERFLOW_RESULT}"
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
