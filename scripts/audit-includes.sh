#!/usr/bin/env bash
set -e

SAFELIST_FILE="config/dead-code-safelist.json"
SAFELIST=$(jq -r '.includes[]' "$SAFELIST_FILE" 2>/dev/null || echo "")

# Find all includes
find _includes -name "*.html" | sed 's|_includes/||' | sort > /tmp/all_includes.txt

# Find all referenced includes
grep -roh "{% include [^%]*%}" _layouts _includes pages blog _posts *.html *.md 2>/dev/null \
  | sed 's/{% include //' | sed 's/ .*//' | sed 's/%}//' \
  | sort -u > /tmp/used_includes.txt

# Find unused includes
UNUSED=$(comm -23 /tmp/all_includes.txt /tmp/used_includes.txt)

# Filter out safelisted includes
if [ -n "$SAFELIST" ]; then
  UNUSED=$(echo "$UNUSED" | grep -vFf <(echo "$SAFELIST") || true)
fi

if [ -n "$UNUSED" ]; then
  echo "❌ Orphaned includes detected:"
  echo "$UNUSED" | sed 's/^/  - _includes\//'
  exit 1
fi

echo "✅ No orphaned includes"
