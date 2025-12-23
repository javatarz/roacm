# Visual Regression Baselines

**IMPORTANT**: When visual snapshots need updating, ALL browsers must be updated or CI will fail.

## Local Updates (Chromium + WebKit)

Always update both together on macOS:

```bash
npm run test:visual -- --update-snapshots --project=chromium
npm run test:visual -- --update-snapshots --project=webkit
```

## Firefox Linux Baselines

Firefox renders differently on macOS vs Linux, so these cannot be updated locally.

1. Push changes and let CI run (it will fail with snapshot mismatches)
2. Download artifacts: `gh run download <run-id>`
3. Copy new snapshots from the downloaded artifact to `test-suite/tests/`
4. Commit the updated baselines
