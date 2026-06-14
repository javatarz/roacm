#!/usr/bin/env bash
set -euo pipefail

RESPONSE=$(curl -sS -H 'User-Agent: nhs-score-check-action' \
  "https://nothumansearch.ai/api/v1/site/karun.me")
SCORE=$(echo "$RESPONSE" | jq -r '.agentic_score // empty')

if [ -z "$SCORE" ]; then
  echo "::warning::karun.me not yet indexed by NHS. Submitting for indexing (allow 24h)."
  curl -s -X POST "https://nothumansearch.ai/api/v1/submit" \
    -H 'Content-Type: application/json' \
    -H 'User-Agent: nhs-score-check-action' \
    -d '{"url":"https://karun.me"}' > /dev/null
  exit 0
fi

echo "NHS score: $SCORE / 100"
if [ "$SCORE" -lt 30 ]; then
  echo "::error::Score $SCORE is below the minimum threshold of 30."
  exit 1
fi
echo "Score $SCORE >= 30. Pass."
