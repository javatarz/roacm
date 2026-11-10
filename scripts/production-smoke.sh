#!/usr/bin/env bash
# Build the production site and run the production-bundle spec against it in the
# pinned Playwright container (same engine as the visual snapshots).
# CI runs the same spec natively against the built artifact: npm run test:production
set -euo pipefail

npm run build:js >/dev/null
JEKYLL_ENV=production bundle exec jekyll build --quiet

CTX="${SNAPSHOT_DOCKER_CONTEXT:-colima-arm64}"
PW_VERSION="$(node -p "require('@playwright/test/package.json').version")"

exec docker --context "$CTX" run --rm \
  --platform linux/arm64 \
  -v "$PWD":/work -w /work \
  -e STATIC_SERVE=1 -e PROD_BUNDLE=1 \
  "mcr.microsoft.com/playwright:v${PW_VERSION}-noble" \
  npx playwright test -c test-suite/configs/playwright.config.ts \
    test-suite/tests/production-bundle.spec.ts --project=chromium "$@"
