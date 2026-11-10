#!/usr/bin/env bash
# Requires: LATEST_POST_URL, LATEST_POST_TITLE env vars
set -euo pipefail

SITE="${SITE:-https://karun.me}"

echo "Checking homepage..."
curl -fsS -o /dev/null -w "%{http_code}" "$SITE/" | grep -q "200"
echo "✅ Homepage OK"

echo "Checking latest post: $LATEST_POST_URL"
curl -fsS -o /dev/null -w "%{http_code}" "$LATEST_POST_URL" | grep -q "200"
echo "✅ Latest post OK"

echo "Checking atom.xml..."
curl -fsS -o /dev/null -w "%{http_code}" "$SITE/atom.xml" | grep -q "200"
echo "✅ atom.xml OK"

echo "Checking production bundle is referenced (JEKYLL_ENV=production)..."
CB="cb=$(date +%s)"
HOME_HTML=$(curl -fsS "$SITE/?$CB")
POST_HTML=$(curl -fsS "$LATEST_POST_URL?$CB")
grep -q "/assets/js/bundle.min.js" <<<"$HOME_HTML" || \
  { echo "❌ Homepage does not reference /assets/js/bundle.min.js (dev build deployed?)"; exit 1; }
grep -q "/assets/js/bundle.min.js" <<<"$POST_HTML" || \
  { echo "❌ Latest post does not reference /assets/js/bundle.min.js (dev build deployed?)"; exit 1; }
echo "✅ Bundle referenced on homepage and latest post"

echo "Checking Umami tracker on latest post..."
grep -Eq "<script[^>]*data-website-id=" <<<"$POST_HTML" || \
  { echo "❌ Umami script tag (data-website-id) missing from latest post"; exit 1; }
echo "✅ Umami tracker present"

echo "Checking bundle.min.js is served and non-trivial..."
curl -fsS -o /dev/null -w "%{http_code}" "$SITE/assets/js/bundle.min.js" | grep -q "200"
BUNDLE_BYTES=$(curl -fsS "$SITE/assets/js/bundle.min.js" | wc -c | tr -d ' ')
[ "$BUNDLE_BYTES" -gt 10000 ] || \
  { echo "❌ bundle.min.js too small ($BUNDLE_BYTES bytes)"; exit 1; }
echo "✅ bundle.min.js OK ($BUNDLE_BYTES bytes)"

echo "Checking latest post title appears on homepage..."
curl -fsS "$SITE/" | grep -qi "$LATEST_POST_TITLE" || \
  { echo "⚠️ Latest post title not found on homepage (cache may be warming)"; }

echo "✅ All smoke tests passed"
