# Website Development Reference

Reference for working on the ROACM website codebase. Load this when working on layouts, components, scripts, or infrastructure.

## Project Overview

ROACM (Ramblings of a Coder's Mind) is a Jekyll-based blog at karun.me using `jekyll-theme-dinky` with customizations for typography, code blocks, reading progress, dark mode, and accessibility.

## Quick Start

```bash
./scripts/setup.sh   # One-time setup (installs Ruby, just, dependencies)
just run             # Start dev server at http://localhost:4000
```

## Development Commands

All commands are available via `just`. Run `just --list` to see all options.

### Common Commands

```bash
just run              # Start dev server (~1s startup)
just test             # Run all tests (lint + e2e)
just lint             # Run all linters
just preflight        # Full validation before release
just new-post "Title" # Create a new blog post
```

### Testing

```bash
just test             # All tests (lint + e2e)
just preflight        # Full validation (all browsers + a11y + lighthouse)
just test-e2e         # E2E tests (chromium by default)
just test-e2e firefox # E2E tests with specific browser
just test-a11y        # Accessibility tests only
just test-lighthouse  # Lighthouse performance tests
just test-visual      # Visual regression tests
```

See `docs/context/TESTING.md` for detailed testing requirements.

### Linting

```bash
just lint             # All linting
just lint-css         # CSS only
just lint-js          # JavaScript only
just lint-html        # HTML only (requires built site)
```

### Dead Code Detection

Automated detection of unused code to prevent silent accumulation.

```bash
just audit                # Run all audits
just audit-css            # Detect unused CSS selectors
just audit-includes       # Detect orphaned Jekyll includes
just audit-images         # Detect unused images
```

**What Gets Detected:**

- **Unused CSS**: Selectors not found in built HTML/JS (via PurgeCSS)
- **Orphaned includes**: Files in `_includes/` not referenced anywhere
- **Unused images**: Files in `assets/images/` not referenced in built site

**Safelist Configuration**: `config/dead-code-safelist.json`

Whitelist legitimate code that should not be flagged:

```json
{
  "css": {
    "classes": ["visible", "is-open"], // Individual class names
    "elements": ["h5", "h6", "canvas"], // HTML elements
    "patterns": ["highlight", "emoji"] // Regex patterns
  },
  "includes": ["analytics.html"], // Specific includes
  "images": ["logo-alt.png"] // Specific images
}
```

**CI Integration**: Runs automatically in `lint-and-validate` job after HTML validation. Build fails if dead code is detected.

**Related**: #155 - Added dead code detection, #146 - Manual cleanup that inspired this automation

### Worktree Management

```bash
just worktrees        # List all active worktrees
just worktree-cleanup # Interactive cleanup of old worktrees
```

### Server Options

```bash
just run                    # Start with defaults
just run --all-posts        # Include all posts (slower)
just run --port 4001        # Custom port (for worktrees)
just run-docker             # Use Docker (slower, but isolated)
```

Server runs at http://localhost:4000 (main) or custom port for worktrees with live reload.

### Dependency Management

**Ruby Gems (Gemfile)**

When adding or removing gems:

1. Edit `Gemfile` (production) and `Gemfile.dev` (development)
2. **Regenerate lockfiles** - CI will fail if lockfiles don't match Gemfiles:

   ```bash
   # With native Ruby (if Ruby 3.2 installed):
   BUNDLE_GEMFILE=Gemfile bundle lock --update
   BUNDLE_GEMFILE=Gemfile.dev bundle lock --update

   # Or with Docker:
   docker run --rm -v $(pwd):/srv/jekyll --user $(id -u):$(id -g) \
     -e BUNDLE_GEMFILE=Gemfile local-jekyll-dev bundle lock --update
   docker run --rm -v $(pwd):/srv/jekyll --user $(id -u):$(id -g) \
     local-jekyll-dev bundle lock --update
   ```

3. Commit both the Gemfile changes AND the lockfile changes together

**npm Packages (package.json)**

```bash
npm install <package> --save-dev   # Add dev dependency
npm uninstall <package>            # Remove dependency
```

Lockfile (`package-lock.json`) updates automatically.

## Key Files and Directories

### Layouts and Templates

- `_layouts/default.html` - Base layout for all pages
- `_layouts/post.html` - Blog post layout
- `_layouts/page.html` - Static page layout
- `_layouts/homepage.html` - Homepage layout

### Components

- `_includes/head.html` - HTML head with meta tags, styles
- `_includes/body/sidebar.html` - Sidebar/header component
- `_includes/body/footer.html` - Footer component
- `_includes/theme_toggle.html` - Dark mode toggle button
- `_includes/search.html` - Search component

### Content

- `_posts/` - Blog posts in markdown format
- `pages/` - Static pages (about, talks, etc.)
- `blog/` - Blog index and related pages

### Styling

- `assets/css/style.scss` - Main stylesheet (imports theme)
- `assets/css/overrides.css` - All theme customizations
- `assets/css/prism-*.css` - Code syntax highlighting themes

### JavaScript

- `assets/js/theme-toggle.js` - Dark mode functionality
- `assets/js/code-blocks.js` - Code block copy buttons
- `assets/js/reading-progress.js` - Reading progress bar
- `assets/js/back-to-top.js` - Back to top button
- `assets/js/search.js` - Client-side search

### Testing

- `test-suite/tests/` - Playwright test files
- `test-suite/configs/` - Test configurations
- `test-suite/tests/*-snapshots/` - Visual regression baselines

See `docs/context/TESTING.md` for testing requirements and workflows.

### Configuration

- `_config.yml` - Jekyll production configuration
- `_config_dev.yml` - Development overrides
- `package.json` - npm scripts and dependencies
- `.github/workflows/ci.yml` - CI/CD pipeline

## Performance & Quality Gates

### Lighthouse Score Thresholds

Lighthouse CI enforces minimum score thresholds that **block builds** if violated.

**Current Thresholds** (in `test-suite/configs/lighthouse.config.js`):

- Performance: 0.96 (96%)
- Accessibility: 0.9 (90%)
- SEO: 0.97 (97%)
- Best Practices: Skipped (sometimes returns null)

### Threshold Management Rules

1. **Thresholds should not decrease** - CI enforces this via `check-lighthouse-thresholds.js`
2. **Update manually** when scores consistently improve above current threshold
3. **Update in small increments** (+0.03 to +0.05) to avoid flakiness
4. **Document reason** in commit message when updating thresholds

### How to Update Thresholds

1. Run `npm run test:lighthouse` locally several times to verify consistent improvement
2. Check recent CI runs to confirm production scores match local
3. Update threshold in `lighthouse.config.js` (e.g., 0.90 → 0.93)
4. Commit with message like: "Update Lighthouse accessibility threshold: 0.90 → 0.93"
5. CI will verify threshold didn't decrease and Lighthouse will verify scores meet new threshold

### Related Issues

- #97 - Lighthouse CI score thresholds (Phase 1)
- #100 - Automate threshold updates (removed - manual updates preferred)
- #101 - Improve Lighthouse scores
- #137 - Improve accessibility score from 0.93 to 0.94+

## Architecture Patterns

### Dark Mode Implementation

- Theme preference stored in localStorage (`theme` key)
- CSS variables in `:root` for light theme, `[data-theme="dark"]` for dark
- JavaScript toggle in `assets/js/theme-toggle.js`
- No flash of unstyled content (FOUC) - theme applied before paint

### Mobile Navigation

- Hamburger menu at viewport < 1280px
- Sidebar slides in from left
- Backdrop overlay when menu open
- Focus trap and keyboard navigation (Escape to close)
- ARIA attributes for accessibility

### Reading Progress

- Sticky progress bar at page top
- Calculated based on scroll position
- Only visible on blog posts

### Code Blocks

- Syntax highlighting via Prism.js themes
- Copy button added dynamically via JavaScript
- Light/dark theme variants for code highlighting
