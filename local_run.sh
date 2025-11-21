#!/bin/sh

set -e
set -x

# Parse arguments
ALL_POSTS=false
for arg in "$@"; do
  case $arg in
    --all-posts)
      ALL_POSTS=true
      shift
      ;;
    *)
      ;;
  esac
done

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
#
# Performance optimizations:
# 1. No jekyll-feed (saves ~30 seconds)
# 2. Limited posts in dev (10 posts = 3-5s vs 112 posts = 29s)
# 3. Incremental builds
# 4. Optimized Docker mount

# Build additional config override if --all-posts flag is set
EXTRA_CONFIG=""
if [ "$ALL_POSTS" = true ]; then
    echo "Building with ALL posts (this will be slower)..."
    # Create temporary config to override limit_posts
    cat > /tmp/_config_all_posts.yml <<EOF
# Temporary config to build all posts
limit_posts: false
EOF
    EXTRA_CONFIG=",/tmp/_config_all_posts.yml"
fi

docker run --rm --platform linux/amd64 \
  -p 4000:4000 -p 35729:35729 \
  -v $(pwd):/srv/jekyll:delegated \
  -v /tmp:/tmp \
  --user $(id -u):$(id -g) \
  -e JEKYLL_ENV=development \
  -e BUNDLE_GEMFILE=Gemfile.dev \
  local-jekyll-dev jekyll serve \
  --host 0.0.0.0 \
  --watch \
  --incremental \
  --force-polling \
  --livereload \
  --config _config.yml,_config_dev.yml${EXTRA_CONFIG}
