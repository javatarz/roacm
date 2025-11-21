#!/bin/sh

set -e
set -x

COLIMA_STATUS=$(colima status --json 2>/dev/null || echo '{}')
COLIMA_RUNNING=$(echo "$COLIMA_STATUS" | grep -q '"status": *"Running"' && echo 1 || echo 0)

if [ "$COLIMA_RUNNING" -eq 1 ]; then
    echo "Colima is running."
else
    echo "Starting Colima."
    colima start --arch x86_64
fi

# Clean incremental cache for fresh start
rm -f .jekyll-metadata
rm -rf .jekyll-cache

# Build with development Gemfile (excludes jekyll-feed for 30s speedup)
docker build --platform linux/amd64 \
  --build-arg BUNDLE_GEMFILE=Gemfile.dev \
  -t local-jekyll-dev .

# Use delegated mount for better macOS performance
# Use dev config and Gemfile for faster builds (no jekyll-feed)
# Use force-polling instead of native file watching (works on Docker+macOS)
# Polling is slower than native watching but faster than before due to:
# 1. No jekyll-feed (saves ~30 seconds)
# 2. Optimized config
# 3. Better Docker mount options
docker run --rm --platform linux/amd64 \
  -p 4000:4000 -p 35729:35729 \
  -v $(pwd):/srv/jekyll:delegated \
  --user $(id -u):$(id -g) \
  -e JEKYLL_ENV=development \
  -e BUNDLE_GEMFILE=Gemfile.dev \
  local-jekyll-dev jekyll serve \
  --host 0.0.0.0 \
  --watch \
  --incremental \
  --force-polling \
  --livereload \
  --config _config.yml,_config_dev.yml
