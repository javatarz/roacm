#!/bin/bash

# ROACM Theme Test Runner
# A convenient script to run theme tests with various options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="all"
BROWSER="chromium"
UPDATE_SNAPSHOTS=false
HEADED=false
CI_MODE=false

# Function to print colored output
print_color() {
  echo -e "${2}${1}${NC}"
}

# Function to show usage
show_usage() {
  cat << EOF
ROACM Theme Test Runner

Usage: ./test-suite/run-tests.sh [OPTIONS]

Options:
  -t, --type TYPE        Test type: all, unit, e2e, visual, a11y, lighthouse (default: all)
  -b, --browser BROWSER  Browser: chromium, firefox, webkit, all (default: chromium)
  -u, --update-snapshots Update visual regression snapshots
  -h, --headed           Run tests in headed mode (show browser)
  --ci                   CI mode - exit immediately after tests complete
  --help                 Show this help message

Examples:
  # Run all tests
  ./test-suite/run-tests.sh

  # Run only visual tests and update snapshots
  ./test-suite/run-tests.sh -t visual -u

  # Run E2E tests in Firefox with visible browser
  ./test-suite/run-tests.sh -t e2e -b firefox -h

  # Run tests in all browsers
  ./test-suite/run-tests.sh -b all

  # Run tests in CI mode (no interactive output)
  ./test-suite/run-tests.sh --ci

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--type)
      TEST_TYPE="$2"
      shift 2
      ;;
    -b|--browser)
      BROWSER="$2"
      shift 2
      ;;
    -u|--update-snapshots)
      UPDATE_SNAPSHOTS=true
      shift
      ;;
    -h|--headed)
      HEADED=true
      shift
      ;;
    --ci)
      CI_MODE=true
      shift
      ;;
    --help)
      show_usage
      exit 0
      ;;
    *)
      print_color "Unknown option: $1" "$RED"
      show_usage
      exit 1
      ;;
  esac
done

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  print_color "Error: npm is not installed. Please install Node.js first." "$RED"
  exit 1
fi

# Function to stop any running Jekyll server
stop_server() {
  # Stop any Docker containers using port 4000
  local container_id=$(docker ps -q --filter "publish=4000" 2>/dev/null)
  if [ -n "$container_id" ]; then
    print_color "Stopping running Jekyll server..." "$YELLOW"
    docker stop "$container_id" >/dev/null 2>&1 || true
    sleep 2
  fi
}

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  print_color "Installing dependencies..." "$YELLOW"
  npm install
fi

# Build command based on options
BUILD_CMD=""
if [ "$HEADED" = true ]; then
  BUILD_CMD="--headed"
fi

if [ "$UPDATE_SNAPSHOTS" = true ]; then
  BUILD_CMD="$BUILD_CMD --update-snapshots"
fi

# In CI mode, use list reporter instead of HTML
if [ "$CI_MODE" = true ]; then
  BUILD_CMD="$BUILD_CMD --reporter=list"
fi

# Function to run tests
run_tests() {
  local test_cmd="$1"
  local test_name="$2"

  print_color "\n🧪 Running $test_name..." "$BLUE"

  if eval "$test_cmd"; then
    print_color "✅ $test_name passed!" "$GREEN"
    return 0
  else
    print_color "❌ $test_name failed!" "$RED"
    return 1
  fi
}

# Track overall success
OVERALL_SUCCESS=true

# Run tests based on type
case $TEST_TYPE in
  all)
    print_color "🚀 Running all theme tests..." "$BLUE"

    # Unit tests
    if ! run_tests "npm run test:unit" "Unit tests"; then
      OVERALL_SUCCESS=false
    fi

    # E2E tests
    if [ "$BROWSER" = "all" ]; then
      for browser in chromium firefox webkit; do
        if ! run_tests "npm run test:e2e -- --project=$browser $BUILD_CMD" "E2E tests ($browser)"; then
          OVERALL_SUCCESS=false
        fi
      done
    else
      if ! run_tests "npm run test:e2e -- --project=$BROWSER $BUILD_CMD" "E2E tests ($BROWSER)"; then
        OVERALL_SUCCESS=false
      fi
    fi

    # Stop server before Lighthouse (it starts its own)
    stop_server

    # Lighthouse
    if ! run_tests "npm run test:lighthouse" "Lighthouse performance tests"; then
      OVERALL_SUCCESS=false
    fi
    ;;

  unit)
    if ! run_tests "npm run test:unit" "Unit tests"; then
      OVERALL_SUCCESS=false
    fi
    ;;

  e2e)
    if [ "$BROWSER" = "all" ]; then
      for browser in chromium firefox webkit; do
        if ! run_tests "npm run test:e2e -- --project=$browser $BUILD_CMD" "E2E tests ($browser)"; then
          OVERALL_SUCCESS=false
        fi
      done
    else
      if ! run_tests "npm run test:e2e -- --project=$BROWSER $BUILD_CMD" "E2E tests ($BROWSER)"; then
        OVERALL_SUCCESS=false
      fi
    fi
    ;;

  visual)
    if [ "$BROWSER" = "all" ]; then
      for browser in chromium firefox webkit; do
        if ! run_tests "npm run test:visual -- --project=$browser $BUILD_CMD" "Visual tests ($browser)"; then
          OVERALL_SUCCESS=false
        fi
      done
    else
      if ! run_tests "npm run test:visual -- --project=$BROWSER $BUILD_CMD" "Visual tests ($BROWSER)"; then
        OVERALL_SUCCESS=false
      fi
    fi
    ;;

  a11y)
    if ! run_tests "npm run test:a11y -- --project=chromium $BUILD_CMD" "Accessibility tests"; then
      OVERALL_SUCCESS=false
    fi
    ;;

  lighthouse)
    if ! run_tests "npm run test:lighthouse" "Lighthouse performance tests"; then
      OVERALL_SUCCESS=false
    fi
    ;;

  *)
    print_color "Error: Unknown test type '$TEST_TYPE'" "$RED"
    show_usage
    exit 1
    ;;
esac

# Clean up any running server
stop_server

# Final summary
echo ""
print_color "═══════════════════════════════════════" "$BLUE"
if [ "$OVERALL_SUCCESS" = true ]; then
  print_color "✨ All tests passed successfully! ✨" "$GREEN"
  print_color "═══════════════════════════════════════" "$BLUE"
  exit 0
else
  print_color "⚠️  Some tests failed. Check the output above." "$RED"
  print_color "═══════════════════════════════════════" "$BLUE"

  # Offer to open test report (only in interactive mode)
  if [ "$CI_MODE" = false ]; then
    echo ""
    read -p "Would you like to open the test report? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      npx playwright show-report test-suite/reports/playwright-html
    fi
  fi

  exit 1
fi