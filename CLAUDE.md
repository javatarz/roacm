# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Squashing Local Commits

- **If a new change logically belongs with an unpushed commit**, recommend squashing to the user
- Use `git commit --fixup=<commit>` then `GIT_SEQUENCE_EDITOR=true git rebase -i --autosquash <commit>~1`
- Only squash commits that haven't been pushed to remote
- This keeps history clean while maintaining small, focused commits during development

### Pre-commit and CI

- **Ensure pre-commit hooks are installed** before committing - verify hooks run successfully
- **After pushing, check pipeline status in the background** - monitor CI and alert user if it fails

## Task Management

- **Finding work**: Use `gh issue list --state open --limit 100` to fetch all open issues
- **After completing a card**: Proactively find the next card by priority (bugs > quick wins > features)
- **Checking pipeline**: Use `gh run list --limit 20 --workflow=ci.yml`. Tests only run when theme files change; look for 3-5+ min runs (not 1-2 min build-only runs)

## Performance & Quality Gates

### Lighthouse Score Thresholds

Lighthouse CI enforces minimum score thresholds that **block builds** if violated:

**Current Thresholds** (in `test-suite/configs/lighthouse.config.js`):

- Performance: 0.70 (70%)
- Accessibility: 0.84 (84%)
- SEO: 0.90 (90%)
- Best Practices: Skipped (sometimes returns null)

**Rules:**

1. **Thresholds only increase, never decrease** - CI enforces this via `check-lighthouse-thresholds.js`
2. **Update manually** when scores consistently improve above current threshold
3. **Update in small increments** (+0.03 to +0.05) to avoid flakiness
4. **Document reason** in commit message when updating thresholds

**How to Update Thresholds:**

1. Run `npm run test:lighthouse` locally several times to verify consistent improvement
2. Check recent CI runs to confirm production scores match local
3. Update threshold in `lighthouse.config.js` (e.g., 0.70 → 0.75)
4. Commit with message like: "Update Lighthouse performance threshold: 0.70 → 0.75"
5. CI will verify threshold didn't decrease and Lighthouse will verify scores meet new threshold

**Related:**

- #97 - Lighthouse CI score thresholds (Phase 1)
- #100 - Automate threshold updates (Phase 2)
- #101 - Improve Lighthouse scores

## Project Overview

ROACM (Ramblings of a Coder's Mind) is a Jekyll-based blog at blog.karun.me using `jekyll-theme-dinky` with customizations for typography, code blocks, reading progress, dark mode, and accessibility.

## Development Commands

```bash
# Local server
./local_run.sh                    # Start Jekyll (limits to 10 posts)
./local_run.sh --all-posts        # Include all posts

# Testing
npm test                          # All tests (lint + e2e)
npm run preflight                 # Full validation (all browsers + a11y + lighthouse)
npm run test:e2e -- --project=chromium  # Single browser

# Linting
npm run lint:css && npm run lint:js && npm run lint:html

# New post
docker run -v $(pwd):/srv/jekyll --user $(id -u):$(id -g) local-jekyll-dev thor jekyll:new "Post Title"
```

Server runs at http://localhost:4000 with live reload.

## Content Guidelines

### Tags and Categories

- **All posts must use canonical tags from `docs/context/TAGS.md`**
- 45 canonical tags organized by category (AI/ML, Dev Experience, Architecture, DevOps, etc.)
- Categories are parents (can have spaces), tags are children (lowercase-hyphenated)
- See `docs/context/CATEGORIES.md` for category guidelines
- New tags require conscious decision - update `docs/context/TAGS.md` when adding
- Run validation script in `docs/context/TAGS.md` to check for non-canonical tags

## Key Files

- `_layouts/` - Page templates (`default.html`, `post.html`, `page.html`)
- `_includes/` - Reusable components (head, sidebar, footer, theme_toggle)
- `_posts/` - Blog posts in markdown
- `assets/css/overrides.css` - All theme customizations
- `assets/js/` - Interactive features (code-blocks, reading-progress, back-to-top, search)
- `test-suite/` - Playwright tests and configs
- `docs/context/` - Context files for Claude Code (TAGS.md, CATEGORIES.md)
