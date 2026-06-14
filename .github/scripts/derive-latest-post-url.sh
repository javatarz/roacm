#!/usr/bin/env bash
set -euo pipefail

latest=$(ls _posts/*.markdown | sort | tail -1)
filename=$(basename "$latest" .markdown)

year=$(echo "$filename" | cut -d- -f1)
month=$(echo "$filename" | cut -d- -f2)
day=$(echo "$filename" | cut -d- -f3)
slug=$(echo "$filename" | cut -d- -f4-)

echo "url=https://karun.me/blog/${year}/${month}/${day}/${slug}/" >> "$GITHUB_OUTPUT"

title=$(grep '^title:' "$latest" | head -1 | sed 's/^title: *//;s/"//g')
echo "title=$title" >> "$GITHUB_OUTPUT"
