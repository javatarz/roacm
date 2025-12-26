#!/bin/sh

set -e
set -x

# Parse arguments
ALL_POSTS=false
FORCE_REBUILD=false
NO_LIVERELOAD=false
PORT=4000
for arg in "$@"; do
  case $arg in
    --all-posts)
      ALL_POSTS=true
      shift
      ;;
    --force-rebuild)
      FORCE_REBUILD=true
      shift
      ;;
    --no-livereload)
      NO_LIVERELOAD=true
      shift
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --port=*)
      PORT="${arg#*=}"
      shift
      ;;
    *)
      ;;
  esac
done

# Check if Jekyll is already running on the specified port
if lsof -i :$PORT >/dev/null 2>&1; then
    echo "Jekyll is already running on port $PORT."
    echo "Visit http://localhost:$PORT or stop the existing process first."
    exit 0
fi

DOCKER_HOST="unix://$HOME/.colima/default/docker.sock"
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

# Check if Docker image exists and if Gemfile.dev has changed
IMAGE_EXISTS=$(docker images -q local-jekyll-dev 2>/dev/null)
REBUILD_NEEDED=false

if [ "$FORCE_REBUILD" = true ]; then
    echo "Force rebuild requested..."
    REBUILD_NEEDED=true
elif [ -z "$IMAGE_EXISTS" ]; then
    echo "Docker image doesn't exist, building..."
    REBUILD_NEEDED=true
else
    # Check if Gemfile.dev is newer than the Docker image
    # Get image creation time
    IMAGE_TIME=$(docker inspect -f '{{.Created}}' local-jekyll-dev 2>/dev/null | cut -d'T' -f1,2 | tr -d 'T:-')
    # Get Gemfile.dev modification time (macOS compatible)
    GEMFILE_TIME=$(stat -f "%Sm" -t "%Y%m%d%H%M%S" Gemfile.dev 2>/dev/null || stat -f "%m" Gemfile.dev 2>/dev/null || echo "0")

    # Simple comparison - if we can't determine, rebuild to be safe
    if [ -f ".docker-build-time" ]; then
        LAST_BUILD=$(cat .docker-build-time)
        GEMFILE_MOD=$(stat -f "%m" Gemfile.dev 2>/dev/null || echo "0")
        if [ "$GEMFILE_MOD" -gt "$LAST_BUILD" ]; then
            echo "Gemfile.dev has changed, rebuilding Docker image..."
            REBUILD_NEEDED=true
        fi
    else
        echo "No build timestamp found, rebuilding Docker image..."
        REBUILD_NEEDED=true
    fi
fi

if [ "$REBUILD_NEEDED" = true ]; then
    # Enable Docker BuildKit for better caching
    export DOCKER_BUILDKIT=1

    # Build with development Gemfile (excludes jekyll-feed for 30s speedup)
    docker build --platform linux/amd64 \
      --build-arg BUNDLE_GEMFILE=Gemfile.dev \
      -t local-jekyll-dev .

    # Store build timestamp
    date +%s > .docker-build-time
else
    echo "Using existing Docker image (use --force-rebuild to rebuild)"
fi

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
    # Create temporary config to override limit_posts (in project dir so Docker can access it)
    # Use large number (0 doesn't work, false doesn't work, need a big number)
    cat > ./_config_all_posts.yml <<EOF
# Temporary config to build all posts
limit_posts: 10000
EOF
    EXTRA_CONFIG=",_config_all_posts.yml"
fi

# Build Jekyll serve command with optional livereload
JEKYLL_ARGS="--host 0.0.0.0 --watch --incremental --force-polling"
LIVERELOAD_PORT=""
if [ "$NO_LIVERELOAD" = false ]; then
    JEKYLL_ARGS="$JEKYLL_ARGS --livereload"
    LIVERELOAD_PORT="-p 35729:35729"
fi

docker run --rm --platform linux/amd64 \
  -p $PORT:4000 $LIVERELOAD_PORT \
  -v $(pwd):/srv/jekyll:delegated \
  -v /tmp:/tmp \
  --user $(id -u):$(id -g) \
  -e JEKYLL_ENV=development \
  -e BUNDLE_GEMFILE=Gemfile.dev \
  local-jekyll-dev jekyll serve \
  $JEKYLL_ARGS \
  --config _config.yml,_config_dev.yml${EXTRA_CONFIG}
