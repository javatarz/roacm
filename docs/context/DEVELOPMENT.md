# Website Development Reference

Reference for working on the ROACM website codebase. Load this when working on layouts, components, scripts, or infrastructure.

## Project Overview

ROACM (Ramblings of a Coder's Mind) is a Jekyll-based blog at karun.me using `jekyll-theme-dinky` with customizations for typography, code blocks, reading progress, dark mode, and accessibility.

## Development Commands

### Local Server

Two options for running Jekyll locally:

**Native Ruby (Recommended - faster startup)**

```bash
./local_run_native.sh             # Start Jekyll (~5-8s startup)
./local_run_native.sh --all-posts # Include all posts
./local_run_native.sh --port 4001 # Custom port (for worktrees)
```

Requires Ruby 3.2 installed via mise, rbenv, or asdf. See [Ruby Setup](#ruby-setup) below.

**Docker (Fallback - slower but isolated)**

```bash
./local_run.sh                    # Start Jekyll (~35s startup)
./local_run.sh --all-posts        # Include all posts
./local_run.sh --port 4001        # Custom port (for worktrees)
```

Requires Docker (via Colima on macOS). Use this if you have Ruby version issues.

Server runs at http://localhost:4000 (main) or custom port for worktrees with live reload.

### Ruby Setup

The project uses Ruby 3.2 (pinned in `.ruby-version` to match CI).

**One-time setup with mise (recommended):**

```bash
# Install mise if you don't have it
curl https://mise.run | sh

# Install Ruby 3.2
mise install ruby@3.2

# Activate in this directory (reads .ruby-version)
mise trust
```

**Or with rbenv:**

```bash
rbenv install 3.2
rbenv local 3.2
```

**Verify setup:**

```bash
ruby -v  # Should show 3.2.x
```

The native script will automatically run `bundle install` when Gemfile.dev changes.

### Testing

```bash
npm test                          # All tests (lint + e2e)
npm run preflight                 # Full validation (all browsers + a11y + lighthouse)
npm run test:e2e -- --project=chromium  # Single browser
npm run test:a11y                 # Accessibility tests only
npm run test:lighthouse           # Lighthouse performance tests
```

See `docs/context/TESTING.md` for detailed testing requirements.

### Linting

```bash
npm run lint                      # All linting
npm run lint:css                  # CSS only
npm run lint:js                   # JavaScript only
npm run lint:html                 # HTML only (requires built site)
```

### Worktree Management

```bash
./scripts/worktree-list.sh        # List all worktrees with status
./scripts/worktree-cleanup.sh     # Interactive cleanup of old worktrees
```

### Creating New Posts

```bash
./scripts/new-post.sh "Post Title"
```

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
- Accessibility: 0.93 (93%)
- SEO: 0.97 (97%)
- Best Practices: Skipped (sometimes returns null)

### Threshold Management Rules

1. **Thresholds only increase, never decrease** - CI enforces this via `check-lighthouse-thresholds.js`
2. **Update manually** when scores consistently improve above current threshold
3. **Update in small increments** (+0.03 to +0.05) to avoid flakiness
4. **Document reason** in commit message when updating thresholds

### How to Update Thresholds

1. Run `npm run test:lighthouse` locally several times to verify consistent improvement
2. Check recent CI runs to confirm production scores match local
3. Update threshold in `lighthouse.config.js` (e.g., 0.93 → 0.96)
4. Commit with message like: "Update Lighthouse accessibility threshold: 0.93 → 0.96"
5. CI will verify threshold didn't decrease and Lighthouse will verify scores meet new threshold

### Related Issues

- #97 - Lighthouse CI score thresholds (Phase 1)
- #100 - Automate threshold updates (Phase 2)
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
