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

### 3. Handle Platform-Specific Visual Snapshots

Visual regression snapshots are platform-specific:

- **macOS/darwin**: `*-chromium-darwin.png`, `*-firefox-darwin.png`, `*-webkit-darwin.png`
- **Linux (CI)**: `*-chromium-linux.png`, `*-firefox-linux.png`, `*-webkit-linux.png`

**When CI fails due to missing Linux snapshots:**

1. Download artifacts from failed CI run:

   ```bash
   gh run download <run-id> --name generated-snapshots-chromium --dir /tmp/snapshots-chromium
   gh run download <run-id> --name generated-snapshots-firefox --dir /tmp/snapshots-firefox
   gh run download <run-id> --name generated-snapshots-webkit --dir /tmp/snapshots-webkit
   ```

2. Copy snapshots to test directories:

   ```bash
   cp /tmp/snapshots-chromium/*/*.png test-suite/tests/
   cp /tmp/snapshots-firefox/*/*.png test-suite/tests/
   cp /tmp/snapshots-webkit/*/*.png test-suite/tests/
   ```

3. Commit and push the new snapshots

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
