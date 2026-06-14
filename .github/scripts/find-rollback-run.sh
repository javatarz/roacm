#!/usr/bin/env bash
# Requires: GH_TOKEN env var. GITHUB_REPOSITORY and GITHUB_RUN_ID are set by Actions.
set -euo pipefail

LAST_RUN_ID=$(gh api \
  "/repos/${GITHUB_REPOSITORY}/actions/workflows/ci.yml/runs?status=success&branch=main&per_page=10" \
  --jq "[.workflow_runs[] | select(.id != ${GITHUB_RUN_ID})] | first | .id")

if [ -z "$LAST_RUN_ID" ] || [ "$LAST_RUN_ID" = "null" ]; then
  echo "::error::No previous successful run found — cannot auto-rollback."
  exit 1
fi

echo "run_id=$LAST_RUN_ID" >> "$GITHUB_OUTPUT"
echo "Rolling back to artifacts from run $LAST_RUN_ID"
