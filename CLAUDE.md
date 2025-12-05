# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ROACM (Ramblings of a Coder's Mind) is a Jekyll-based blog hosted at blog.karun.me. It uses the `jekyll-theme-dinky` theme with extensive customizations for typography, code blocks, reading progress, dark mode, and accessibility.

## Development Commands

### Local Development Server

```bash
./local_run.sh                    # Start Jekyll server (limits to 10 posts for speed)
./local_run.sh --all-posts        # Include all posts (slower, ~29s vs ~5s)
./local_run.sh --force-rebuild    # Rebuild Docker image
```

Server runs at http://localhost:4000 with live reload.

### Testing

```bash
npm test                  # Run all tests (lint + e2e)
npm run preflight         # Full pre-merge validation (lint + all browsers + a11y + lighthouse)
npm run test:unit         # Linting only (CSS, JS, HTML)
npm run test:e2e          # Playwright e2e tests
npm run test:visual       # Visual regression tests
npm run test:a11y         # Accessibility tests
npm run test:lighthouse   # Performance tests

# Run single test file or specific test
npx playwright test -c test-suite/configs/playwright.config.ts --grep "test name"
npx playwright test -c test-suite/configs/playwright.config.ts tests/theme.spec.ts

# Run tests in specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Update visual regression baselines (local - Chromium/WebKit only)
npm run test:visual -- --update-snapshots --project=chromium
npm run test:visual -- --update-snapshots --project=webkit
```

### Visual Regression Baselines

**IMPORTANT**: When visual snapshots need updating, ALL browsers must be updated or CI will fail.

1. **Local updates (Chromium + WebKit)**: Always update both together on macOS:

   ```bash
   npm run test:visual -- --update-snapshots --project=chromium
   npm run test:visual -- --update-snapshots --project=webkit
   ```

2. **Firefox Linux baselines** (cannot be updated locally - renders differently on macOS vs Linux):
   - Push changes and let CI run (it will fail with snapshot mismatches)
   - Download artifacts: `gh run download <run-id>`
   - Copy new snapshots from the downloaded artifact to `test-suite/tests/`
   - Commit the updated baselines

### Linting Individual Files

```bash
npm run lint:css          # Stylelint for assets/css/
npm run lint:js           # ESLint for assets/js/
npm run lint:html         # HTMLHint for generated HTML
```

### Create New Post

```bash
docker run -v $(pwd):/srv/jekyll --user $(id -u):$(id -g) local-jekyll-dev thor jekyll:new "Post Title"
```

## Architecture

### Jekyll Structure

- `_config.yml` - Production config
- `_config_dev.yml` - Development overrides (excludes jekyll-feed, limits posts)
- `_layouts/` - Page templates: `default.html`, `post.html`, `page.html`
- `_includes/` - Reusable components (head, sidebar, footer, theme_toggle)
- `_includes/head/` - SEO meta tags, social sharing, stylesheets
- `_posts/` - Blog posts in markdown format
- `archive.html` - All posts grouped by year
- `assets/css/overrides.css` - All theme customizations
- `assets/js/` - Interactive features (code-blocks, reading-progress, back-to-top, search)

### Theme Features

The site includes custom JavaScript for:

- Dark/light theme toggle with localStorage persistence
- Reading progress bar
- Back-to-top button
- Code block copy functionality
- Site search (lunr.js)
- Auto-generated table of contents for long posts

### Testing Infrastructure

- `test-suite/configs/` - Tool configurations (Playwright, Lighthouse, ESLint, Stylelint)
- `test-suite/tests/theme.spec.ts` - Main test file
- `test-suite/reports/` - Generated reports (gitignored)

### Pre-commit Hooks

Husky runs lint-staged on commit, which auto-fixes and validates:

- **CSS**: Stylelint + Prettier
- **JS**: ESLint + Prettier
- **MD**: Prettier

### Docker Setup

Uses Colima for Docker on macOS. The `local_run.sh` script:

1. Starts Colima if not running
2. Builds/reuses `local-jekyll-dev` Docker image
3. Runs Jekyll with incremental builds and live reload

### CI/CD

- `.github/workflows/jekyll.yml` - Builds and deploys to S3 on main branch
- `.github/workflows/theme-tests.yml` - Runs tests on theme file changes

## Key Files

- `Gemfile` - Production Ruby dependencies
- `Gemfile.dev` - Development dependencies (excludes jekyll-feed for 30s speedup)
- `package.json` - Node.js test dependencies and npm scripts
- `local_run.sh` - Development server startup script

## Task Management

- **Finding work**: Always check GitHub issues to find cards to work on. Use `gh issue list --state open --limit 100` to fetch all open issues (not just the default 30).
- **Closing issues**: Prefer closing issues via commit message (e.g., `Fixes #38`) rather than running `gh issue close`. This links the fix to the commit automatically.
- **After completing a card**: Push the changes and proactively find the next most important card to pick up based on priority (bugs first, then quick wins, then features).
