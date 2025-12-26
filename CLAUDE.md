# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow

### Trunk-Based Development

- **Push directly to main** - no pull requests unless there's specific risk to mitigate
- **If risk exists**, present it to the user with reasoning and let them approve a PR
- Examples of risk: large refactors, breaking API changes, untested edge cases
- Default assumption: trunk-based is safe when tests pass

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

### Worktree Workflow

Use Git worktrees to work on multiple issues in parallel without switching branches or stashing:

**Commands:**

- `/pickup-on-worktree <issue-number>` - Create dedicated worktree for an issue
- `/pickup-on-worktree` - List all active worktrees with ports
- `./scripts/worktree-list.sh` - Detailed worktree status with merge info
- `./scripts/worktree-cleanup.sh` - Interactive cleanup of old worktrees

**Port Assignment:**

- Main repo uses port 4000
- Worktrees use ports 4001-4010 (10 parallel worktrees max)
- Port embedded in worktree name: `../roacm-4001-issue-123`
- When all ports in use, cleanup required before creating new worktree

**Naming Convention:**

- Worktree path: `../roacm-<PORT>-issue-<NUMBER>`
- Branch name: `issue-<NUMBER>`
- Location: Parallel to main repo, not inside it

**Context Tracking:**

- After creating worktree, Claude automatically switches working context to it
- All subsequent commands run from the worktree until context changes
- Switch contexts with: "Switch to main repo", "Switch to worktree 4002"
- Claude periodically confirms current working location

**Workflow:**

1. Create worktree: `/pickup-on-worktree 123`
2. Claude switches context automatically
3. Work on the issue (tests, commits, etc.)
4. Push changes: `git push -u origin issue-123`
5. Create PR from worktree
6. Switch to another context or clean up: `git worktree remove ../roacm-4001-issue-123`

**Benefits:**

- Work on multiple issues simultaneously
- No branch switching or stashing
- Separate Jekyll servers per worktree (different ports)
- Clean separation of work-in-progress

## Context Files for Different Work Types

**Load context based on the type of work:**

### Website/Theme Development

When working on layouts, components, CSS, JavaScript, or any theme files:

- **Read `docs/context/TESTING.md`** - Testing requirements, test locations, platform-specific snapshots

### Blog Content Creation/Editing

When creating or editing blog posts:

- **Read `docs/context/TAGS.md`** - Canonical tag list
- **Read `docs/context/CATEGORIES.md`** - Valid categories and descriptions
- **Read `docs/context/CONTENT.md`** - Content guidelines
- **Read `docs/context/STYLE.md`** - Writing style guidelines

### Homepage/Landing Pages

When working on the homepage or other landing pages:

- **Read `docs/context/HOMEPAGE.md`** - Homepage structure and sections

**Do not load all context files at once - only load what's relevant to the current task.**

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
./local_run.sh --port 4001        # Custom port (for worktrees)

# Testing
npm test                          # All tests (lint + e2e)
npm run preflight                 # Full validation (all browsers + a11y + lighthouse)
npm run test:e2e -- --project=chromium  # Single browser

# Linting
npm run lint:css && npm run lint:js && npm run lint:html

# Worktree management
./scripts/worktree-list.sh        # List all worktrees
./scripts/worktree-cleanup.sh     # Clean up old worktrees

# New post
docker run -v $(pwd):/srv/jekyll --user $(id -u):$(id -g) local-jekyll-dev thor jekyll:new "Post Title"
```

Server runs at http://localhost:4000 (main) or custom port for worktrees with live reload.

## Content Guidelines

### Tags and Categories

When creating or editing blog posts, **always read the context files first** - do not search existing posts:

- **Read `docs/context/TAGS.md`** for the canonical tag list (45 tags organized by topic)
- **Read `docs/context/CATEGORIES.md`** for valid categories and their descriptions
- Categories are parents (can have spaces), tags are children (lowercase-hyphenated)
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
