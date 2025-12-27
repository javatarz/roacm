#!/bin/bash

set -e

# Native Ruby Jekyll server (faster than Docker)
# Requires Ruby 3.2 installed via mise, rbenv, or asdf

# Activate mise if available (needed for non-interactive shells like git hooks)
# Check common mise locations since PATH may be limited in hooks
for mise_path in "$HOME/.local/bin/mise" "/opt/homebrew/bin/mise" "/usr/local/bin/mise"; do
    if [ -x "$mise_path" ]; then
        eval "$("$mise_path" activate bash 2>/dev/null)" || true
        break
    fi
done

# Parse arguments
NO_LIVERELOAD=false
PORT=4000
for arg in "$@"; do
  case $arg in
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

# Check Ruby version
REQUIRED_RUBY="3.2"
CURRENT_RUBY=$(ruby -v 2>/dev/null | grep -oE '[0-9]+\.[0-9]+' | head -1)

if [ -z "$CURRENT_RUBY" ]; then
    echo "Error: Ruby not found."
    echo ""
    echo "Please install Ruby $REQUIRED_RUBY using one of:"
    echo "  - mise: mise install ruby@$REQUIRED_RUBY"
    echo "  - rbenv: rbenv install $REQUIRED_RUBY"
    echo "  - asdf: asdf install ruby $REQUIRED_RUBY"
    echo ""
    echo "Or use Docker: ./local_run.sh"
    exit 1
fi

if [ "$CURRENT_RUBY" != "$REQUIRED_RUBY" ]; then
    echo "Warning: Ruby $CURRENT_RUBY detected, but $REQUIRED_RUBY is recommended (matching CI)."
    echo "Consider switching with: mise use ruby@$REQUIRED_RUBY"
    echo ""
fi

# Check if bundler is installed
if ! command -v bundle >/dev/null 2>&1; then
    echo "Installing bundler..."
    gem install bundler
fi

# Use Gemfile.dev for faster builds (no jekyll-feed)
export BUNDLE_GEMFILE=Gemfile.dev

# Clean up CI-specific bundle config if present
if [ -f ".bundle/config" ] && grep -q "/home/runner" .bundle/config 2>/dev/null; then
    rm -rf .bundle
fi

# Configure bundle for local development
bundle config set --local path 'vendor/bundle' 2>/dev/null || true
bundle config unset --local deployment 2>/dev/null || true

# Check if bundle install is needed
BUNDLE_HASH_FILE=".bundle-hash"
CURRENT_HASH=$(cat Gemfile.dev Gemfile.dev.lock 2>/dev/null | md5 -q 2>/dev/null || md5sum 2>/dev/null | cut -d' ' -f1)

if [ -f "$BUNDLE_HASH_FILE" ]; then
    STORED_HASH=$(cat "$BUNDLE_HASH_FILE")
    if [ "$CURRENT_HASH" != "$STORED_HASH" ]; then
        echo "Gemfile.dev changed, running bundle install..."
        bundle install
        echo "$CURRENT_HASH" > "$BUNDLE_HASH_FILE"
    fi
else
    # First run or hash file missing
    if [ ! -d "vendor/bundle" ] && [ ! -d ".bundle" ]; then
        echo "First run, installing gems..."
        bundle install
    fi
    echo "$CURRENT_HASH" > "$BUNDLE_HASH_FILE"
fi

# Clean incremental cache for fresh start
rm -f .jekyll-metadata
rm -rf .jekyll-cache

# Build Jekyll serve command
JEKYLL_ARGS="--watch --incremental"

if [ "$NO_LIVERELOAD" = false ]; then
    JEKYLL_ARGS="$JEKYLL_ARGS --livereload"
fi

# Build config string
CONFIG="_config.yml,_config_dev.yml"

echo ""
echo "Starting Jekyll on http://localhost:$PORT"
echo ""

# Run Jekyll
bundle exec jekyll serve \
    $JEKYLL_ARGS \
    --port $PORT \
    --config $CONFIG
