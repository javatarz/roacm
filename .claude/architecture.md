# Architecture

## Jekyll Structure

- `_config.yml` - Production config
- `_config_dev.yml` - Development overrides (excludes jekyll-feed, limits posts)
- `_layouts/` - Page templates: `default.html`, `post.html`, `page.html`
- `_includes/` - Reusable components (head, sidebar, footer, theme_toggle)
- `_includes/head/` - SEO meta tags, social sharing, stylesheets
- `_posts/` - Blog posts in markdown format
- `archive.html` - All posts grouped by year
- `assets/css/overrides.css` - All theme customizations
- `assets/js/` - Interactive features (code-blocks, reading-progress, back-to-top, search)

## Theme Features

The site includes custom JavaScript for:

- Dark/light theme toggle with localStorage persistence
- Reading progress bar
- Back-to-top button
- Code block copy functionality
- Site search (lunr.js)
- Auto-generated table of contents for long posts

## Testing Infrastructure

- `test-suite/configs/` - Tool configurations (Playwright, Lighthouse, ESLint, Stylelint)
- `test-suite/tests/theme.spec.ts` - Main test file
- `test-suite/reports/` - Generated reports (gitignored)

## Pre-commit Hooks

Husky runs lint-staged on commit, which auto-fixes and validates:

- **CSS**: Stylelint + Prettier
- **JS**: ESLint + Prettier
- **MD**: Prettier

## Docker Setup

Uses Colima for Docker on macOS. The `local_run.sh` script:

1. Starts Colima if not running
2. Builds/reuses `local-jekyll-dev` Docker image
3. Runs Jekyll with incremental builds and live reload

## CI/CD

- `.github/workflows/ci.yml` - Full CI/CD pipeline (builds, tests, deploys to S3 on main)

## Infrastructure

- **Cloudflare**: Provides CDN caching but does NOT optimize images (free plan limitation). Images are cached but served at original size unless pre-optimized.
- **AWS S3**: Static site hosting
- **GitHub Actions**: CI/CD pipeline
