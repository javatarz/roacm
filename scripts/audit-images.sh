#!/usr/bin/env bash
set -e

SAFELIST_FILE="config/dead-code-safelist.json"
SITE_DIR="${SITE_DIR:-_site}"
SAFELIST=$(jq -r '.images[]' "$SAFELIST_FILE" 2>/dev/null || echo "")

IMAGES=$(find assets/images -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" -o -name "*.svg" \))

# One pass over the text files in the built site: collect every image-like
# filename, then look images up in that set (a grep per image takes minutes)
USED=$(grep -rhoIE '[A-Za-z0-9._@%+-]+\.(png|jpe?g|gif|webp|svg)' "$SITE_DIR" 2>/dev/null | sort -u || true)

UNUSED=""
while IFS= read -r img; do
  basename=$(basename "$img")

  # Skip if safelisted
  if echo "$SAFELIST" | grep -qF "$basename"; then
    continue
  fi

  if ! echo "$USED" | grep -qxF "$basename"; then
    UNUSED="${UNUSED}${img}\n"
  fi
done <<< "$IMAGES"

if [ -n "$UNUSED" ]; then
  echo -e "❌ Unused images detected:"
  echo -e "$UNUSED" | sed 's/^/  - /' | grep -v '^  - $'
  exit 1
fi

echo "✅ No unused images"
