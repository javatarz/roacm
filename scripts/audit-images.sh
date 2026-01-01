#!/usr/bin/env bash
set -e

SAFELIST_FILE="config/dead-code-safelist.json"
SAFELIST=$(jq -r '.images[]' "$SAFELIST_FILE" 2>/dev/null || echo "")

UNUSED=""
# Find all image files recursively in assets/images/
while IFS= read -r img; do
  basename=$(basename "$img")

  # Skip if safelisted
  if echo "$SAFELIST" | grep -qF "$basename"; then
    continue
  fi

  if ! grep -rq "$basename" _site/; then
    UNUSED="${UNUSED}${img}\n"
  fi
done < <(find assets/images -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" -o -name "*.svg" \))

if [ -n "$UNUSED" ]; then
  echo -e "❌ Unused images detected:"
  echo -e "$UNUSED" | sed 's/^/  - /' | grep -v '^  - $'
  exit 1
fi

echo "✅ No unused images"
