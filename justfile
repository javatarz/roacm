# ROACM Blog - Development Commands
# Run `just` or `just --list` to see all available commands

# Default recipe - show help
default:
    @just --list

# ─────────────────────────────────────────────────────────────────────────────
# Development
# ─────────────────────────────────────────────────────────────────────────────

# Start development server (native Ruby - fast)
run *args:
    ./local_run_native.sh {{args}}


# One-time project setup
setup:
    ./scripts/setup.sh

# ─────────────────────────────────────────────────────────────────────────────
# Testing
# ─────────────────────────────────────────────────────────────────────────────

# Run all tests (lint + e2e)
test:
    npm test

# Run full preflight checks (all browsers + a11y + lighthouse)
preflight:
    npm run preflight

# Run E2E tests (default: chromium)
test-e2e browser="chromium":
    npm run test:e2e -- --project={{browser}}

# Run visual regression tests
test-visual browser="chromium":
    npm run test:visual -- --project={{browser}}

# Run accessibility tests
test-a11y:
    npm run test:a11y

# Run Lighthouse performance tests
test-lighthouse:
    npm run test:lighthouse

# ─────────────────────────────────────────────────────────────────────────────
# Linting
# ─────────────────────────────────────────────────────────────────────────────

# Run all linters
lint:
    npm run lint

# Lint CSS files
lint-css:
    npm run lint:css

# Lint JavaScript files
lint-js:
    npm run lint:js

# Lint HTML (requires built site)
lint-html:
    npm run lint:html

# Audit for dead code (requires built site)
audit:
    npm run audit:dead-code

# Audit CSS for unused selectors
audit-css:
    npm run audit:css

# Audit for orphaned includes
audit-includes:
    npm run audit:includes

# Audit for unused images
audit-images:
    npm run audit:images

# ─────────────────────────────────────────────────────────────────────────────
# Content
# ─────────────────────────────────────────────────────────────────────────────

# Create a new blog post
new-post title:
    ./scripts/new-post.sh "{{title}}"

# ─────────────────────────────────────────────────────────────────────────────
# Build
# ─────────────────────────────────────────────────────────────────────────────

# Build JavaScript bundle for production
build-js:
    npm run build:js

# Transform images to picture elements
images-transform:
    npm run images:transform

# Optimize and generate responsive images
images-optimize:
    npm run images:optimize

# ─────────────────────────────────────────────────────────────────────────────
# Worktrees (parallel development)
# ─────────────────────────────────────────────────────────────────────────────

# List all active worktrees
worktrees:
    ./scripts/worktree-list.sh

# Interactive cleanup of old worktrees
worktree-cleanup:
    ./scripts/worktree-cleanup.sh
