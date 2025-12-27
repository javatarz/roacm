#!/usr/bin/env bash
set -e

SAFELIST_FILE="config/dead-code-safelist.json"
SAFELIST=$(jq -r '.images[]' "$SAFELIST_FILE" 2>/dev/null || echo "")

UNUSED=""
for ext in png jpg jpeg gif webp svg; do
  for img in assets/images/*.$ext; do
    [ -f "$img" ] || continue
    basename=$(basename "$img")

    # Skip if safelisted
    if echo "$SAFELIST" | grep -qF "$basename"; then
      continue
    fi

    if ! grep -rq "$basename" _site/; then
      UNUSED="${UNUSED}${img}\n"
    fi
  done
done

if [ -n "$UNUSED" ]; then
  echo -e "❌ Unused images detected:"
  echo -e "$UNUSED" | sed 's/^/  - /' | grep -v '^  - $'
  exit 1
fi

echo "✅ No unused images"
