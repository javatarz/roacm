# Testing Requirements for Website/Theme Development

**CRITICAL: When modifying theme files, layouts, includes, or components, ALWAYS check for related tests first.**

This context applies ONLY to website/theme development work. Do not use when working on blog posts.

## Before Making Changes

### 1. Search for Related Tests

Always search for tests that reference the component you're modifying:

```bash
grep -r "component-id|component-class|component-selector" test-suite/tests/
```

Replace `component-id|component-class|component-selector` with the actual identifiers from your component.

### 2. Check for Accessibility Tests

When changing any of the following, check for accessibility tests:

- **HTML structure** (especially semantic elements like `<header>`, `<nav>`, `<main>`, `<aside>`)
- **ARIA attributes** (`role`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-*`)
- **Interactive elements** (buttons, links, forms, modals, menus)
- **Focus management** or keyboard navigation
- **Color contrast** or theme-related changes

**Common ARIA Rules:**

- `<header>` elements cannot have `role="navigation"` (use `<nav>` instead)
- Semantic HTML elements have implicit roles - don't override unless necessary
- Every interactive element needs an accessible name (label, aria-label, or aria-labelledby)

### 3. Check for Visual Regression Tests

When changing any of the following, check for visual regression tests:

- **CSS/styling** changes
- **Layout structure** modifications
- **Component visibility** or positioning
- **Dark mode** styles
- **Responsive breakpoints** or media queries

## After Making Changes

### 1. Update Related Tests

If you modified HTML structure or ARIA attributes, update the tests to match the new implementation.

**Example:**

```typescript
// Before: Test expects role="navigation"
await expect(sidebar).toHaveAttribute('role', 'navigation');

// After: Test verifies role is NOT present (semantic <header> doesn't need it)
await expect(sidebar).not.toHaveAttribute('role', 'navigation');
```

### 2. Run Tests Locally

**Quick verification** (chromium only, faster feedback):

```bash
npm run test:e2e -- --project=chromium
```

**Full verification** (all browsers + accessibility + lighthouse):

```bash
npm run preflight
```

**Individual test suites:**

```bash
npm run test:e2e          # Visual + E2E tests
npm run test:a11y         # Accessibility tests only
npm run test:lighthouse   # Lighthouse performance tests
npm run lint              # Linting (CSS, JS, HTML)
```

### 3. Update Visual Snapshots (when a style change is intentional)

Visual baselines are **Linux-only** — Linux is the build we deploy, and it's the
one platform we can reproduce identically both locally and in CI. Snapshots are
rendered inside a pinned Playwright Docker container (architecture forced to
`linux/amd64` to match the CI runner), so what you generate locally matches CI
byte-for-byte. There is no download-from-CI step anymore.

**When you make an intentional style change, regenerate baselines with one command:**

```bash
npm run snapshots          # regenerate Linux baselines for chromium/firefox/webkit
```

This fans out to **3 parallel Docker containers** (one per browser), so wall-clock
time is the slowest single browser (~4–5 min regen, ~4 min verify) rather than the
serial sum (~15 min). Tests are render-bound (font/image waits via `stabilize()`),
not CPU-bound — increasing `PLAYWRIGHT_WORKERS` or adding CPU to the Colima VM
does not meaningfully improve speed (measured, see #228).

Then commit the changed `*-linux.png` files and push. CI compares against them
and goes green on the first try — no round-trip.

Requirements: Docker running (a native arm64 Colima profile, see below), plus
Ruby/Jekyll and Node (already used by this repo). The first run pulls the container
image (~1–2 GB, one-time).

**Colima setup (one-time, if not already done):**

```bash
colima start --profile pw --arch aarch64 --cpu 4 --memory 6
```

Other commands:

```bash
npm run snapshots:verify            # compare only, all 3 browsers (what CI runs)
npm run snapshots:verify -- --project=chromium   # one browser
scripts/visual-snapshots.sh --project=chromium --project=firefox  # two browsers in parallel
```

> Don't run `playwright test --update-snapshots` natively — it would write
> `*-darwin.png` files (gitignored, never used). Always go through `npm run snapshots`.

**Per-browser HTML reports** (parallel runs only): each browser writes to its own
`test-suite/reports/playwright-html-<browser>/` dir so reports don't overwrite
each other.

#### Targeted regen (fastest path for isolated changes)

When you change one page's layout or a specific component, you don't need to
regen all 180 snapshots. Use `snapshots:targeted` to regen only affected tests:

```bash
npm run snapshots:targeted              # auto-detect from git diff
npm run snapshots:targeted -- homepage  # explicit page name / grep pattern
npm run snapshots:targeted -- "dark mode"
npm run snapshots:targeted -- --verify  # compare only (no update)
npm run snapshots:targeted -- --dry-run # show what would run without running
```

#### Regen only failed snapshots (after a blocked push)

When the pre-push hook blocks with snapshot failures, Playwright writes the
failed test IDs to `test-results/.last-run.json`. Use `--last-failed` to regen
only those tests across all three browsers:

```bash
npm run snapshots:failed
```

This reads `.last-run.json` (written by the Docker container to the mounted
working dir) and skips every test that passed. Fastest when the diff is small
but `snapshots:targeted` over-targets (e.g. global CSS change that only broke
one page in practice).

Typical wall-clock times (warm Colima VM, 3 browsers in parallel):

| Change type     | Tests/browser      | Wall-clock |
| --------------- | ------------------ | ---------- |
| Homepage layout | ~5                 | ~20s       |
| Theme toggle    | ~8                 | ~30s       |
| Mobile menu     | ~9                 | ~35s       |
| Global CSS      | falls back to full | ~2 min     |

Auto-detection maps changed files to test patterns. Global changes (CSS, default
layout, sidebar) fall back to a full regen automatically.

## Common Test Locations

### Accessibility Tests

- **Location**: `test-suite/tests/mobile-menu.spec.ts`
- **Covers**: ARIA attributes, focus management, keyboard navigation, WCAG compliance
- **Run with**: `npm run test:a11y`

### Theme Tests

- **Location**: `test-suite/tests/theme.spec.ts`
- **Covers**: Dark mode, theme toggle, CSS variables, responsive design
- **Run with**: `npm run test:e2e -- test-suite/tests/theme.spec.ts`

### Visual Regression Tests

- **Location**: `test-suite/tests/visual.spec.ts`
- **Covers**: All pages (homepage, blog, archive, about, talks, etc.) across all viewports
- **Run with**: `npm run test:e2e -- test-suite/tests/visual.spec.ts`

### Mobile Menu Tests

- **Location**: `test-suite/tests/mobile-menu.spec.ts`
- **Covers**: Hamburger menu, sidebar, mobile navigation, touch targets
- **Run with**: `npm run test:e2e -- test-suite/tests/mobile-menu.spec.ts`

## Example Workflow: Fixing ARIA Violation

**Scenario**: Lighthouse reports "ARIA role not allowed for element"

❌ **Wrong Approach**:

1. Remove `role="navigation"` from `<header>`
2. Commit and push
3. CI fails because tests expect the role

✅ **Correct Approach**:

1. Search for tests:

   ```bash
   grep -r "mobile-sidebar" test-suite/tests/
   ```

2. Find test in `mobile-menu.spec.ts:260`:

   ```typescript
   await expect(sidebar).toHaveAttribute('role', 'navigation');
   ```

3. Update HTML (remove invalid ARIA role):

   ```html
   <!-- Before -->
   <header id="mobile-sidebar" role="navigation" aria-label="Site navigation">
     <!-- After -->
     <header id="mobile-sidebar" aria-label="Site header"></header>
   </header>
   ```

4. Update test (verify role is NOT present):

   ```typescript
   // Semantic <header> shouldn't have role="navigation"
   await expect(sidebar).not.toHaveAttribute('role', 'navigation');
   await expect(sidebar).toHaveAttribute('aria-label', 'Site header');
   ```

5. Run tests locally:

   ```bash
   npm run test:e2e -- --project=chromium
   ```

6. Commit both changes together (HTML + test update)

## Lighthouse Thresholds

Lighthouse CI enforces minimum score thresholds. See the "Performance & Quality Gates" section in CLAUDE.md for details on threshold management.

**Quick reference** (from `test-suite/configs/lighthouse.config.js`):

- Performance: 0.96 (96%)
- Accessibility: 0.94 (94%)
- SEO: 0.97 (97%)

If a change causes Lighthouse to fail, investigate the root cause before reducing thresholds.
