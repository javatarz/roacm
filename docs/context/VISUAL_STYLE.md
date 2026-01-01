# Visual Style Guide

UI and visual design principles for the blog. Use when making theme, CSS, or styling changes.

## Design Principles

### Links Must Stand Out

Links should be **immediately recognizable by color alone** without relying on underlines. If you need to hover to identify a link, the color isn't distinct enough.

### Theme Consistency

The blog uses a red/coral accent color family. New accent colors should stay within this family while meeting visibility requirements.

### Accessibility Target

Aim for good accessibility while balancing design goals:

- **Target**: Lighthouse accessibility score of 0.9 or higher
- **Ideal**: WCAG AA standards (4.5:1 contrast for normal text, 3:1 for large text)
- **Reality**: Some contrast issues accepted in favor of visual design

Pipeline breaks if accessibility score falls below **0.9** on Lighthouse.

**Always test locally** before committing: `npm run test:lighthouse`

## Link Styling Principles

### Visual Treatment

- **Color, not underlines**: Links use distinct color to stand out
- **Hover feedback**: Provide visual feedback on hover (opacity change, etc.)
- **Visited links maintain vibrancy**: Don't mute visited links - they should remain clearly visible

### Exceptions

Some elements use link tags but shouldn't look like text links:

- Navigation elements (header, footer, sidebar)
- Card components and tiles
- Buttons and call-to-action elements
- Tag pills and category badges
- Icon-only links

### External Link Indicators

Links to external sites (outside the blog domain) should have a visual indicator (e.g., arrow icon).

## Color System

### Hierarchy

The site uses a three-tier color system:

- **Primary text**: Main body content and headings
- **Secondary text**: Metadata, labels, supporting information (lighter/less prominent)
- **Accent**: Links, active states, interactive highlights (must be distinct and vibrant)

### CSS Inheritance Issues

**Watch for nested selectors**: Elements like `em`, `strong`, `code` may set explicit colors that override link colors. Links inside these elements need explicit accent color rules to remain visible.

## Dark Mode Requirements

### Dual Implementation

Dark mode must work in two scenarios:

1. **JavaScript-enabled**: Uses `[data-theme='dark']` attribute
2. **JavaScript-disabled**: Falls back to `@media (prefers-color-scheme: dark)`

Both must be implemented for any color that changes between modes.

### Testing Requirement

**Every color change must be tested in both light and dark modes.** Don't assume it works - verify it.

### Opacity and Blending

Elements with reduced opacity require brighter base colors to maintain contrast after blending with the background. Test the **rendered result**, not just the CSS value.

Semi-transparent overlays on backgrounds affect how colors appear - always verify the final visual result meets contrast requirements.

## Accessibility Requirements

### Lighthouse Threshold

Pipeline **fails** if accessibility score < 0.9. This is enforced in CI.

### Contrast Guidelines

Aim for good contrast while balancing design aesthetics:

- **Large text** (18pt+ or 14pt+ bold): ≥ 3:1 contrast ratio (should meet)
- **Normal text**: ≥ 4.5:1 contrast ratio ideal (WCAG AA), some flexibility allowed
- **Practical approach**: Prioritize readability, especially for body content

### Testing Checklist

Before committing color changes:

1. Run `npm run test:lighthouse` locally
2. Verify in **both** light and dark modes
3. Check visited link visibility
4. Test links in special contexts (emphasis, code, nested elements)
5. Verify rendered contrast, not just CSS values (opacity affects final color)

## Common Pitfalls

### Visited Links Becoming Invisible

Applying opacity to visited links makes them blend with body text. Keep visited links at full opacity.

### Nested Element Color Overrides

Parent elements (`em`, `strong`, `code`) may set explicit colors that hide link colors. Always add explicit rules for links inside these elements.

### Opacity Blending

Elements with reduced opacity need brighter base colors. A color that meets contrast requirements at 100% opacity may fail when rendered at 60% opacity.

**Rule**: Test the actual rendered appearance, not just the CSS color value.

### Missing Dark Mode Fallbacks

Lighthouse runs without JavaScript, so it won't see `[data-theme='dark']` styles. Every dark mode color needs a `@media (prefers-color-scheme: dark)` fallback.

### Lighthouse Calculates Blended Colors

Lighthouse computes the final rendered color after opacity blending. A color that "looks fine" may fail the accessibility check because the computed contrast ratio doesn't meet requirements.

## When Making Visual Changes

1. **Understand the principle** being violated or improved
2. **Test thoroughly**: Both modes, visited states, nested contexts
3. **Run Lighthouse locally** before pushing
4. **Update visual snapshots** if needed: `npm run test:visual -- --update-snapshots --project=chromium`
5. **Commit separately** from content changes

## Evolution

This guide captures principles, not implementation. When the design evolves:

1. Update principles if the core philosophy changes
2. Add new pitfalls as they're discovered
3. Keep examples general - avoid specific color codes or pixel values
4. Focus on "why" over "what"
