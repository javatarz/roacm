#!/usr/bin/env bash
set -e

echo "🔍 Checking for duplicate images by content..."

# Create temp file for checksums
temp_file=$(mktemp)
trap "rm -f $temp_file" EXIT

# Calculate checksums for all images
find assets/images -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" -o -name "*.svg" \) -exec md5 {} + | sort -k4 > "$temp_file"

# Find duplicate checksums
duplicates=$(awk '{print $NF}' "$temp_file" | uniq -d)

if [ -n "$duplicates" ]; then
  echo "❌ Duplicate images detected (by content):"
  echo
  for hash in $duplicates; do
    echo "Hash: $hash"
    grep "$hash" "$temp_file" | awk '{print "  - " $2}' | sed 's/(//' | sed 's/)//'
    echo
  done
  exit 1
fi

echo "✅ No duplicate images found (by content)"
