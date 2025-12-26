#!/bin/bash
#
# Create a new blog post with proper frontmatter
#
# Usage: ./scripts/new-post.sh "My Post Title"
#

set -e

if [ -z "$1" ]; then
    echo "Usage: ./scripts/new-post.sh \"Post Title\""
    echo "Example: ./scripts/new-post.sh \"My Awesome Blog Post\""
    exit 1
fi

title="$*"
date=$(date +%Y-%m-%d)

# Convert title to URL slug (lowercase, spaces to hyphens, remove special chars)
slug=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g' | sed 's/--*/-/g')

filename="_posts/${date}-${slug}.markdown"

if [ -f "$filename" ]; then
    echo "Error: $filename already exists!"
    exit 1
fi

echo "Creating new post: $filename"

cat > "$filename" << EOF
---
layout: post
comments: true
author: Karun Japhet
title: "${title}"
description: ""
categories:
  -
tags:
  -
---

EOF

echo "Created: $filename"

# Open in editor (defaults to VS Code)
${EDITOR:-code} "$filename"
