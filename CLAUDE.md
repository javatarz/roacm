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

- `.github/workflows/ci.yml` - Full CI/CD pipeline (builds, tests, deploys to S3 on main)

### Image Optimization

Images are optimized during CI build (not at source). The pipeline:

1. Jekyll builds the site
2. `scripts/transform-images.mjs` - Transforms `<img>` tags to `<picture>` elements with WebP sources
3. `scripts/optimize-images.mjs` - Converts images to WebP, compresses originals, generates srcset widths

**Key points:**

- Source images in `assets/images/` stay at original quality
- New images are automatically optimized on next deploy
- WebP served with PNG/JPG fallbacks for older browsers
- Responsive srcset widths: 640w, 960w, 1280w

### Infrastructure

- **Cloudflare**: Provides CDN caching but does NOT optimize images (free plan limitation). Images are cached but served at original size unless pre-optimized.
- **AWS S3**: Static site hosting
- **GitHub Actions**: CI/CD pipeline

## Key Files

- `Gemfile` - Production Ruby dependencies
- `Gemfile.dev` - Development dependencies (excludes jekyll-feed for 30s speedup)
- `package.json` - Node.js test dependencies and npm scripts
- `local_run.sh` - Development server startup script

## Task Management

- **Finding work**: Always check GitHub issues to find cards to work on. Use `gh issue list --state open --limit 100` to fetch all open issues (not just the default 30).
- **After completing a card**: Proactively find the next most important card to pick up based on priority (bugs first, then quick wins, then features).
- **Checking pipeline status**: Use `gh run list --limit 20 --workflow=ci.yml` to check the CI/CD pipeline. Do NOT rely on generic `gh run list` as it shows Dependabot update runs, not the actual test pipeline. Look for runs on the `main` branch with workflow "CI/CD Pipeline". **Important**: Tests don't run on every commit—only when theme-related files change. To verify tests actually ran, look for runs with duration of 3-5+ minutes (test runs) vs ~1-2 minutes (build-only). If recent runs are all short build-only runs, go back in history to find the last full test run and verify it passed.

## Git Workflow

### User Approval Required

- **Never commit without checking with the user first** - explain what will be committed and why
- **Never push without asking the user** - always confirm before pushing to remote
- **If a change must temporarily break the system, stop and ask** - don't proceed with breaking changes without explicit approval

### Commit Granularity

- **Each commit should be the smallest independent change** that doesn't break the system
- **Prefer many small commits over few large ones** - each commit should do one thing
- **Close issues via commit message** when possible (e.g., `Fixes #38`) to link fixes to commits

### Commit Message Format

Follow [cbea.ms/git-commit](https://cbea.ms/git-commit/) guidelines:

1. Separate subject from body with a blank line
2. Keep subject line concise (~50 chars, avoid exceeding 72)
3. Capitalize the subject line
4. Do not end the subject line with a period
5. Use imperative mood ("Add feature" not "Added feature")
6. Use body to explain **what and why**, not how

### Pre-commit and CI

- **Ensure pre-commit hooks are installed** before committing - verify hooks run successfully
- **After pushing, check pipeline status in the background** - monitor CI and alert user if it fails
