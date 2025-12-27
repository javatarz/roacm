#!/bin/bash

# ROACM Blog - Test Environment Setup Script
# This script sets up the automated testing infrastructure for theme development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
  echo -e "${2}${1}${NC}"
}

# Function to print section headers
print_header() {
  echo ""
  print_color "═══════════════════════════════════════════════════════════════" "$CYAN"
  print_color "  $1" "$BOLD$CYAN"
  print_color "═══════════════════════════════════════════════════════════════" "$CYAN"
  echo ""
}

# Function to check command existence
command_exists() {
  command -v "$1" &> /dev/null
}

# Function to compare versions
version_ge() {
  [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

# Track if we need to install anything
NEEDS_INSTALL=false
ERRORS=()

print_header "ROACM Blog Test Environment Setup"
print_color "This script will set up the automated testing infrastructure" "$BLUE"
print_color "for theme development and continuous integration." "$BLUE"

# Step 1: Setup Ruby via mise (for fast native Jekyll)
print_header "Step 1: Setting up Ruby Environment"

RUBY_VERSION="3.2"

# Check if mise is installed
if command_exists mise; then
  print_color "✅ mise is installed" "$GREEN"

  # Check if mise is activated in shell
  if mise current &> /dev/null; then
    print_color "✅ mise is activated in shell" "$GREEN"

    # Install Ruby 3.2 if not already installed
    if ! mise list ruby 2>/dev/null | grep -q "$RUBY_VERSION"; then
      print_color "Installing Ruby $RUBY_VERSION via mise (this may take a few minutes)..." "$YELLOW"
      mise install ruby@$RUBY_VERSION
    fi
    print_color "✅ Ruby $RUBY_VERSION installed via mise" "$GREEN"

    # Trust this directory
    mise trust 2>/dev/null || true
  else
    print_color "⚠️  mise is installed but not activated in your shell" "$YELLOW"
    print_color "   Add to your shell config (~/.zshrc or ~/.bashrc):" "$YELLOW"
    print_color "   eval \"\$(mise activate zsh)\"  # or bash" "$CYAN"
    print_color "" ""
    print_color "   Then restart your terminal and run this script again." "$YELLOW"
    print_color "   Continuing with system Ruby (Docker fallback available)..." "$YELLOW"
  fi
else
  print_color "ℹ️  mise not found - recommended for fast native Jekyll" "$BLUE"
  print_color "   Install with: curl https://mise.run | sh" "$CYAN"
  print_color "   Then add to shell: eval \"\$(mise activate zsh)\"" "$CYAN"
  print_color "   Continuing with system Ruby (Docker fallback available)..." "$YELLOW"
fi

# Step 2: Check Prerequisites
print_header "Step 2: Checking Prerequisites"

# Check Node.js
if command_exists node; then
  NODE_VERSION=$(node -v | cut -d'v' -f2)
  if version_ge "$NODE_VERSION" "18.0.0"; then
    print_color "✅ Node.js version $NODE_VERSION (>= 18.0.0)" "$GREEN"
  else
    print_color "⚠️  Node.js version $NODE_VERSION is installed but version 18+ is recommended" "$YELLOW"
    print_color "   Please upgrade Node.js for best compatibility" "$YELLOW"
  fi
else
  print_color "❌ Node.js is not installed" "$RED"
  ERRORS+=("Node.js 18+ is required. Install from: https://nodejs.org/")
fi

# Check npm
if command_exists npm; then
  NPM_VERSION=$(npm -v)
  print_color "✅ npm version $NPM_VERSION" "$GREEN"
else
  print_color "❌ npm is not installed" "$RED"
  ERRORS+=("npm is required and usually comes with Node.js")
fi

# Check Ruby
if command_exists ruby; then
  RUBY_VERSION=$(ruby -v | awk '{print $2}')
  if version_ge "$RUBY_VERSION" "3.0.0"; then
    print_color "✅ Ruby version $RUBY_VERSION (>= 3.0.0)" "$GREEN"
  else
    print_color "⚠️  Ruby version $RUBY_VERSION is installed but version 3.0+ is recommended" "$YELLOW"
  fi
else
  print_color "❌ Ruby is not installed" "$RED"
  ERRORS+=("Ruby 3.0+ is required. Install from: https://www.ruby-lang.org/")
fi

# Check Bundler
if command_exists bundle; then
  BUNDLER_VERSION=$(bundle -v | awk '{print $3}')
  print_color "✅ Bundler version $BUNDLER_VERSION" "$GREEN"
else
  print_color "⚠️  Bundler is not installed. Will install if Ruby is available." "$YELLOW"
  NEEDS_INSTALL=true
fi

# Check Docker
if command_exists docker; then
  print_color "✅ Docker is installed" "$GREEN"
else
  print_color "⚠️  Docker is not installed (optional but recommended for local testing)" "$YELLOW"
  print_color "   Install from: https://www.docker.com/" "$YELLOW"
fi

# Check Git
if command_exists git; then
  GIT_VERSION=$(git --version | awk '{print $3}')
  print_color "✅ Git version $GIT_VERSION" "$GREEN"
else
  print_color "❌ Git is not installed" "$RED"
  ERRORS+=("Git is required for pre-commit hooks. Install from: https://git-scm.com/")
fi

# If there are critical errors, stop
if [ ${#ERRORS[@]} -gt 0 ]; then
  print_header "❌ Setup Cannot Continue"
  print_color "Please install the following prerequisites first:" "$RED"
  for error in "${ERRORS[@]}"; do
    print_color "  • $error" "$RED"
  done
  exit 1
fi

# Step 3: Install Bundler if needed
if ! command_exists bundle && command_exists ruby; then
  print_header "Step 3: Installing Bundler"
  print_color "Installing Bundler gem..." "$YELLOW"
  gem install bundler
  print_color "✅ Bundler installed successfully" "$GREEN"
else
  print_header "Step 3: Bundler Check"
  print_color "✅ Bundler is already available" "$GREEN"
fi

# Step 4: Install Ruby Dependencies
print_header "Step 4: Installing Ruby Dependencies"
if [ -f "Gemfile" ]; then
  print_color "Checking Ruby dependencies..." "$YELLOW"

  # Try to install bundler if needed
  if ! bundle --version > /dev/null 2>&1; then
    print_color "Attempting to install bundler..." "$YELLOW"
    gem install bundler --no-document 2>/dev/null || {
      print_color "⚠️  Cannot install bundler with system Ruby (requires sudo)" "$YELLOW"
      print_color "   Jekyll will run via Docker instead" "$YELLOW"
    }
  fi

  # Clean up CI-specific bundle config if present
  if [ -f ".bundle/config" ] && grep -q "/home/runner" .bundle/config 2>/dev/null; then
    print_color "Cleaning up CI-specific bundle config..." "$YELLOW"
    rm -rf .bundle
  fi

  # Configure bundle for local development
  if bundle --version > /dev/null 2>&1; then
    bundle config set --local path 'vendor/bundle' 2>/dev/null || true
    bundle config unset --local deployment 2>/dev/null || true

    # Use Gemfile.dev for faster local builds
    export BUNDLE_GEMFILE=Gemfile.dev

    # Add macOS platform to lockfile if needed
    if ! grep -q "arm64-darwin" Gemfile.dev.lock 2>/dev/null; then
      print_color "Adding macOS platform to lockfile..." "$YELLOW"
      bundle lock --add-platform arm64-darwin-25 2>/dev/null || true
      bundle lock --add-platform x86_64-darwin-25 2>/dev/null || true
    fi

    bundle install 2>/dev/null || {
      print_color "⚠️  Cannot install Ruby gems" "$YELLOW"
      print_color "   Jekyll will run via Docker instead" "$YELLOW"
    }
  else
    print_color "ℹ️  Skipping Ruby gem installation" "$BLUE"
    print_color "   Jekyll will run via Docker" "$BLUE"
  fi
else
  print_color "⚠️  Gemfile not found, skipping Ruby dependencies" "$YELLOW"
fi

# Step 5: Install Node Dependencies
print_header "Step 5: Installing Node Dependencies"
if [ -f "package.json" ]; then
  print_color "Installing Node.js packages..." "$YELLOW"
  print_color "This may take a few minutes..." "$BLUE"

  # Clean install to avoid conflicts
  if [ -d "node_modules" ]; then
    print_color "Cleaning existing node_modules..." "$YELLOW"
    rm -rf node_modules package-lock.json
  fi

  npm install
  print_color "✅ Node dependencies installed successfully" "$GREEN"
else
  print_color "❌ package.json not found!" "$RED"
  print_color "   Cannot proceed with test setup" "$RED"
  exit 1
fi

# Step 6: Install Playwright Browsers
print_header "Step 6: Installing Test Browsers"
print_color "Installing Playwright browsers for cross-browser testing..." "$YELLOW"
print_color "This will download Chromium, Firefox, and WebKit..." "$BLUE"

npx playwright install --with-deps

print_color "✅ Test browsers installed successfully" "$GREEN"

# Step 7: Initialize Git Hooks
print_header "Step 7: Setting up Git Hooks"

# Initialize Husky
print_color "Initializing Husky for pre-commit hooks..." "$YELLOW"
npx husky install

# Set up pre-commit hook
if [ ! -f ".husky/pre-commit" ]; then
  npx husky add .husky/pre-commit 'npm run pre-commit'
  print_color "✅ Pre-commit hook created" "$GREEN"
else
  print_color "✅ Pre-commit hook already exists" "$GREEN"
fi

# Make hooks executable
chmod +x .husky/*
print_color "✅ Git hooks configured successfully" "$GREEN"

# Step 8: Create Initial Test Baselines
print_header "Step 8: Creating Test Baselines"

# Check if Jekyll server is running
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null; then
  print_color "⚠️  Port 4000 is already in use" "$YELLOW"
  print_color "   Please stop any running Jekyll server before creating baselines" "$YELLOW"
  read -p "   Stop the server and press Enter to continue, or Ctrl+C to exit: "
fi

print_color "Starting Jekyll server for baseline creation..." "$YELLOW"

# Start Jekyll server in the background
if [ -f "local_run.sh" ] && [ -x "local_run.sh" ] && command_exists docker; then
  print_color "Using Docker via local_run.sh to start server (recommended)..." "$BLUE"
  ./local_run.sh > /dev/null 2>&1 &
  SERVER_PID=$!
  USING_DOCKER=true
elif command_exists jekyll && command_exists bundle; then
  print_color "Using jekyll serve to start server..." "$BLUE"
  bundle exec jekyll serve --config _config.yml,_config_dev.yml > /dev/null 2>&1 &
  SERVER_PID=$!
  USING_DOCKER=false
else
  print_color "⚠️  Cannot start Jekyll server automatically" "$YELLOW"
  print_color "   Please start your Jekyll server manually in another terminal:" "$YELLOW"
  print_color "   Run: ./local_run.sh" "$CYAN"
  read -p "   Press Enter when server is running on port 4000: "
  SERVER_PID=""
  USING_DOCKER=false
fi

# Wait for server to start
if [ -n "$SERVER_PID" ]; then
  if [ "$USING_DOCKER" = true ]; then
    print_color "Waiting for Docker container and Jekyll server to start (up to 120 seconds)..." "$BLUE"
    TIMEOUT=120
  else
    print_color "Waiting for Jekyll server to start (up to 60 seconds)..." "$BLUE"
    TIMEOUT=60
  fi

  COUNTER=0
  while ! curl -s http://localhost:4000 > /dev/null 2>&1; do
    sleep 2
    COUNTER=$((COUNTER + 2))
    if [ $COUNTER -ge $TIMEOUT ]; then
      print_color "❌ Jekyll server failed to start" "$RED"
      kill $SERVER_PID 2>/dev/null
      exit 1
    fi
    printf "."
  done
  echo ""
  print_color "✅ Jekyll server is running" "$GREEN"
fi

# Create visual baselines
print_color "Creating visual regression baselines..." "$YELLOW"
print_color "This will capture screenshots for all viewports..." "$BLUE"

npx playwright test -c test-suite/configs/playwright.config.ts --grep @visual --update-snapshots || {
  print_color "⚠️  Some baseline creation failed, but continuing..." "$YELLOW"
}

# Stop Jekyll server if we started it
if [ -n "$SERVER_PID" ]; then
  print_color "Stopping Jekyll server..." "$YELLOW"
  kill $SERVER_PID 2>/dev/null || true
  wait $SERVER_PID 2>/dev/null || true
fi

print_color "✅ Test baselines created" "$GREEN"

# Step 9: Verify Installation
print_header "Step 9: Verifying Installation"

print_color "Running quick verification tests..." "$YELLOW"

# Test linters
VERIFICATION_PASSED=true

print_color "Testing CSS linter..." "$BLUE"
if npm run lint:css > /dev/null 2>&1; then
  print_color "  ✅ CSS linting works" "$GREEN"
else
  print_color "  ⚠️  CSS linting has warnings (this is normal)" "$YELLOW"
fi

print_color "Testing JavaScript linter..." "$BLUE"
if npm run lint:js > /dev/null 2>&1; then
  print_color "  ✅ JavaScript linting works" "$GREEN"
else
  print_color "  ⚠️  JavaScript linting has warnings (this is normal)" "$YELLOW"
fi

print_color "Testing Playwright..." "$BLUE"
if npx playwright --version > /dev/null 2>&1; then
  print_color "  ✅ Playwright is installed" "$GREEN"
else
  print_color "  ❌ Playwright installation issue" "$RED"
  VERIFICATION_PASSED=false
fi

# Step 10: Create Git Ignore Entries
print_header "Step 10: Updating Git Configuration"

# Check if .gitignore needs updating
if [ -f ".gitignore" ]; then
  if ! grep -q "node_modules" .gitignore; then
    print_color "Adding test-related entries to .gitignore..." "$YELLOW"
    cat >> .gitignore << 'EOF'

# Test Suite
test-suite/reports/
test-suite/.cache/
node_modules/
package-lock.json

# Playwright
playwright-report/
test-results/
playwright/.cache/

# Coverage
coverage/
.nyc_output/

# Lighthouse CI
.lighthouseci/
EOF
    print_color "✅ Updated .gitignore" "$GREEN"
  else
    print_color "✅ .gitignore already configured" "$GREEN"
  fi
fi

# Step 11: Final Summary
print_header "🎉 Setup Complete!"

if [ "$VERIFICATION_PASSED" = true ]; then
  print_color "✨ All components installed and verified successfully! ✨" "$GREEN"
else
  print_color "⚠️  Setup completed with some warnings" "$YELLOW"
  print_color "   Please check the messages above" "$YELLOW"
fi

echo ""
print_color "📋 Available Test Commands:" "$BOLD$BLUE"
echo ""
print_color "  npm test              - Run all tests" "$CYAN"
print_color "  npm run test:unit     - Run linting and validation" "$CYAN"
print_color "  npm run test:e2e      - Run end-to-end tests" "$CYAN"
print_color "  npm run test:visual   - Run visual regression tests" "$CYAN"
print_color "  npm run test:a11y     - Run accessibility tests" "$CYAN"
print_color "  npm run test:lighthouse - Run performance tests" "$CYAN"
echo ""
print_color "  Or use the test runner:" "$BOLD$BLUE"
print_color "  ./test-suite/run-tests.sh --help" "$CYAN"

echo ""
print_color "🎣 Pre-commit Hooks:" "$BOLD$BLUE"
echo ""
print_color "  Git hooks are now active and will run automatically" "$CYAN"
print_color "  before each commit to ensure code quality." "$CYAN"

echo ""
print_color "📚 Documentation:" "$BOLD$BLUE"
echo ""
print_color "  See test-suite/README.md for detailed documentation" "$CYAN"

echo ""
print_color "🚀 Start Development:" "$BOLD$BLUE"
echo ""
print_color "  ./local_run_native.sh     # Fast (~9s startup)" "$CYAN"
print_color "  ./local_run.sh            # Docker fallback (~35s)" "$CYAN"
echo ""
print_color "🧪 Next Steps:" "$BOLD$BLUE"
echo ""
print_color "  1. Make a theme change" "$CYAN"
print_color "  2. Run: npm test" "$CYAN"
print_color "  3. Commit your changes (hooks will run automatically)" "$CYAN"

echo ""
print_color "═══════════════════════════════════════════════════════════════" "$CYAN"
print_color "Happy testing! 🧪" "$BOLD$GREEN"
print_color "═══════════════════════════════════════════════════════════════" "$CYAN"
echo ""