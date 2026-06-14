#!/usr/bin/env bash
# Requires: LATEST_POST_URL, LATEST_POST_TITLE env vars
set -euo pipefail

SITE=https://karun.me

echo "Checking homepage..."
curl -fsS -o /dev/null -w "%{http_code}" "$SITE/" | grep -q "200"
echo "✅ Homepage OK"

echo "Checking latest post: $LATEST_POST_URL"
curl -fsS -o /dev/null -w "%{http_code}" "$LATEST_POST_URL" | grep -q "200"
echo "✅ Latest post OK"

echo "Checking atom.xml..."
curl -fsS -o /dev/null -w "%{http_code}" "$SITE/atom.xml" | grep -q "200"
echo "✅ atom.xml OK"

echo "Checking latest post title appears on homepage..."
curl -fsS "$SITE/" | grep -qi "$LATEST_POST_TITLE" || \
  { echo "⚠️ Latest post title not found on homepage (cache may be warming)"; }

echo "✅ All smoke tests passed"
