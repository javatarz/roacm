#!/usr/bin/env bash
set -euo pipefail

latest=""
for f in $(ls _posts/*.markdown | sort -r); do
  frontmatter=$(awk '/^---$/{c++; next} c==1' "$f")
  if echo "$frontmatter" | grep -qE '^published:[[:space:]]*false[[:space:]]*$'; then
    continue
  fi
  latest="$f"
  break
done

if [ -z "$latest" ]; then
  echo "::error::No published post found in _posts/"
  exit 1
fi

filename=$(basename "$latest" .markdown)

year=$(echo "$filename" | cut -d- -f1)
month=$(echo "$filename" | cut -d- -f2)
day=$(echo "$filename" | cut -d- -f3)
slug=$(echo "$filename" | cut -d- -f4-)

echo "url=https://karun.me/blog/${year}/${month}/${day}/${slug}/" >> "$GITHUB_OUTPUT"

title=$(grep '^title:' "$latest" | head -1 | sed 's/^title: *//;s/"//g')
echo "title=$title" >> "$GITHUB_OUTPUT"
