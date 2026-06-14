# SCSS Phase 3 Design Spec

Issue: #277

## Goal

Semantic cleanup of the SCSS partials introduced in Phase 1. No behaviour changes.
Three sub-tasks in order, each committed and tested independently.

## Task sequence

| #   | Task                    | Output                 | Verification              |
| --- | ----------------------- | ---------------------- | ------------------------- |
| 1   | Badge `@mixin` factory  | Changes selector order | Visual snapshots          |
| 2   | Shared mixin extraction | Byte-identical         | Build diff (empty = pass) |
| 3   | Color tokenization      | Changes CSS values     | Visual snapshots          |

## Task 1 — Badge `@mixin` factory (`_talks.scss`)

### Problem

Five badge types each have two declarations (light + dark). All follow the same
pattern: tinted background at 0.15 opacity light / 0.3 dark, solid text color.
Adding a sixth badge type requires writing four lines in two separate blocks.

### Design

One `@mixin talk-badge-colors` parameterised on RGB components and light/dark
text colors. Dark variant uses SCSS parent nesting `[data-theme='dark'] &` so
each badge type is defined in a single `@include` call.

```scss
@mixin talk-badge-colors($r, $g, $b, $light, $dark) {
  background: rgb($r, $g, $b, 0.15);
  color: $light;

  [data-theme='dark'] & {
    background: rgb($r, $g, $b, 0.3);
    color: $dark;
  }
}

.talk-badge-panel {
  @include talk-badge-colors(103, 58, 183, #673ab7, #b39ddb);
}
.talk-badge-podcast {
  @include talk-badge-colors(46, 125, 50, #1b5e20, #a5d6a7);
}
.talk-badge-talk {
  @include talk-badge-colors(0, 131, 143, #006064, #80deea);
}
.talk-badge-bof {
  @include talk-badge-colors(103, 58, 183, #673ab7, #b39ddb);
}
.talk-badge-workshop {
  @include talk-badge-colors(25, 118, 210, #1565c0, #90caf9);
}
```

### Test plan

SCSS nesting groups each badge's dark rule after its light rule; the original
separates all-light from all-dark. Output order changes — specificity is
unaffected, rendered result is identical. Verify with visual snapshots.

```bash
npm run snapshots
```

## Task 2 — Shared mixin extraction

### Problem

Three property groups are duplicated across multiple partials. Duplication
means a future change (e.g. card border-radius) requires hunting down every
occurrence.

### Why `@mixin` not `%placeholder`

`@extend %placeholder` groups selectors in the output — not byte-identical.
`@mixin` inlines properties per-selector — byte-identical. Same DRY benefit in
source, simpler test plan.

### Mixins

**`@mixin card-base`** — `_variables.scss` or top of first user file.

```scss
@mixin card-base {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}
```

Users: `.post-card` (`_blog-index.scss`), `.homepage-card` (`_homepage.scss`).

Note: `.related-post-card` uses `--bg-secondary` not `--card-bg` — does not qualify.

---

**`@mixin hover-lift`**

```scss
@mixin hover-lift {
  transform: translateY(-2px);
}
```

Users: `.post-card:hover`, `.featured-post-card:hover` (`_blog-index.scss`),
`.upcoming-ribbon:hover`, `.homepage-contact-cta:hover` (`_homepage.scss`),
`.related-post-card:hover` (`_related-posts.scss`), `.author-bio a:hover`
(`_author-bio.scss`), hover states in `_rouge.scss`.

---

**`@mixin grid-3col`** — gap varies per usage site (20px or 16px), so gap stays
per-component.

```scss
@mixin grid-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
```

Users: `.recent-posts-grid` / `.category-posts-grid` (`_blog-index.scss`),
`.homepage-cards-grid` (`_homepage.scss`), `.related-posts-grid`
(`_related-posts.scss`).

### Test plan

```bash
bundle exec jekyll build --config _config.yml
npm run build:css
diff /tmp/phase3-pre-mixin.css _site/assets/css/overrides.css
# Must be empty
```

Capture the baseline before starting this task.

## Task 3 — Color tokenization

### Problem

Hard-coded hex values scattered across partials make it impossible to change a
color in one place. Some values (sidebar white, hero gradients) have no semantic
name — their intent is unclear from the value alone.

### Scope

- **In scope:** all non-rouge SCSS partials
- **Out of scope:** `_rouge.scss` (Monokai syntax highlight palette, unrelated
  to UI theme)

### Design

Two tiers:

1. **Base palette** — SCSS compile-time vars. Named colors, no runtime cost.
   Only created for values that appear in 2+ semantic tokens.
2. **Semantic CSS vars** — CSS custom properties. Reference base palette.
   Components use these. Dark mode overrides defined in `[data-theme='dark']`.

#### Base palette (added to `_variables.scss`, above `:root`)

```scss
$color-white: #ffffff; // sidebar, hero, text on dark surfaces
$color-off-white: #f5f5f5; // light secondary bg, print code bg
$color-dark: #1a1a1a; // near-black; dark theme bg, hero gradient
$color-dark-mid: #2d2d2d; // hero gradient step
$color-dark-deep: #0d0d0d; // hero darkest gradient stop
$color-gray-muted: #cccccc; // sidebar muted text, print borders
$color-red-ribbon: #c62828; // ribbon gradient start
$color-red-deep: #8d0000; // ribbon gradient end
$color-red-cta: #c9302c; // CTA button
$color-green-confirm: #15803d; // share button "copied" state
```

#### New semantic CSS vars (added to `_variables.scss`)

```scss
:root {
  /* Sidebar — always dark regardless of theme */
  --sidebar-text: #{$color-white};
  --sidebar-text-muted: #{$color-gray-muted};

  /* Text on permanently-dark surfaces (hero, recorded badge) */
  --text-on-dark: #{$color-white};

  /* Homepage hero gradient — changes between themes */
  --hero-bg-start: #{$color-dark};
  --hero-bg-end: #{$color-dark-mid};

  /* Ribbon and CTA — fixed red, no theme variation */
  --ribbon-bg-start: #{$color-red-ribbon};
  --ribbon-bg-end: #{$color-red-deep};
  --cta-bg: #{$color-red-cta};

  /* Share button "copied" confirmation */
  --share-copied: #{$color-green-confirm};
}

[data-theme='dark'] {
  /* Hero darkens further in dark mode */
  --hero-bg-start: #{$color-dark-deep};
  --hero-bg-end: #{$color-dark};
}
```

#### Mapping table

| Hard-coded value                                      | Replaced with                               | Location                        |
| ----------------------------------------------------- | ------------------------------------------- | ------------------------------- |
| `#ffffff` on sidebar                                  | `var(--sidebar-text)`                       | `_layout.scss`                  |
| `#cccccc` on sidebar                                  | `var(--sidebar-text-muted)`                 | `_layout.scss`                  |
| `#ffffff` on hero/badge                               | `var(--text-on-dark)`                       | `_homepage.scss`, `_talks.scss` |
| `#1a1a1a`/`#2d2d2d` in hero                           | `var(--hero-bg-start/end)`                  | `_homepage.scss`                |
| `#0d0d0d`/`#1a1a1a` dark hero                         | `var(--hero-bg-start/end)`                  | `_homepage.scss`                |
| `#c62828`/`#8d0000` ribbon                            | `var(--ribbon-bg-start/end)`                | `_homepage.scss`                |
| `#c9302c` CTA                                         | `var(--cta-bg)`                             | `_homepage.scss`                |
| `#15803d` share                                       | `var(--share-copied)`                       | `_share-buttons.scss`           |
| `#1a1a1a` skip link dark text                         | `var(--bg-primary)`                         | `_deprecation.scss`             |
| `#e0e0e0` toc title                                   | `var(--code-text)`                          | `_toc.scss`                     |
| `#404040` search dark border                          | `var(--border-color)`                       | `_search.scss`                  |
| `#ffffff`/`#cccccc` in `_print.scss` `:root`          | `#{$color-white}` / `#{$color-gray-muted}`  | `_print.scss`                   |
| `background/color: #ffffff` in `_print.scss` elements | `var(--bg-primary)` / `var(--text-primary)` | `_print.scss`                   |

#### Stays inline

- `rgb(0,0,0,X)` shadow values — self-evident, no semantic relationship to other tokens
- Single-occurrence isolated values with no cross-file relationship
- `_rouge.scss` — excluded entirely

### Test plan

One commit per partial changed. Visual snapshots after all partials are done.
Hard-coded hex → CSS var should produce identical rendered output since the var
resolves to the same value.

```bash
npm run snapshots
# Zero pixel diff expected
```

If any snapshot shows a diff: investigate before committing further.

## Implementation context (read before starting)

### Current state

- Branch: `main`. Phase 2 committed and pushed, CI green.
- SCSS partials: `_sass/overrides/` (20 files). Entry point: `assets/css/overrides.scss`.
- Jekyll uses `sass-embedded` (Dart Sass 1.100) — SCSS nesting and `@mixin`/`@include` work.
- Stylelint is configured with `postcss-scss` custom syntax for `.scss` files (upgraded in Phase 2). SCSS variable syntax passes lint.
- Live Jekyll server runs externally — no need to start one for verification.

### Build commands

```bash
# Full build + minify
bundle exec jekyll build --config _config.yml && npm run build:css

# Lint
npm run lint:css

# Visual snapshots (requires colima arm64 + Docker)
npm run snapshots
```

### Where to define shared mixins

All three mixins (`card-base`, `hover-lift`, `grid-3col`) go in `_variables.scss`,
after the SCSS compile-time variables and before `:root`. This keeps all
compile-time constructs in one place.

### Baseline capture (Task 2)

Before starting Task 2, capture the post-Task-1 minified output:

```bash
bundle exec jekyll build --config _config.yml && npm run build:css
cp _site/assets/css/overrides.css /tmp/phase3-pre-mixin.css
```

### Commit granularity

- Task 1: one commit for `_talks.scss`
- Task 2: one commit covering all three mixins + all usage sites together (output is byte-identical, safe to bundle)
- Task 3: one commit per partial changed, visual snapshots after all partials done

## Constraints

- Do not replace CSS custom properties (`var(--)`) with SCSS vars — runtime vars
  drive the dark mode toggle
- `_rouge.scss` untouched
- One commit per task; visual snapshots after tasks 1 and 3
