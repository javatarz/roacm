#!/usr/bin/env bash
#
# Targeted snapshot regen — regenerate only the snapshots affected by recent
# changes, rather than the full suite (~180 snapshots across 3 browsers).
#
# Detects changed files via `git diff HEAD` (staged + unstaged vs HEAD) and
# maps them to Playwright grep patterns. Falls back to full regen when the
# changes are too broad (e.g. global CSS or shared includes).
#
# Usage:
#   npm run snapshots:targeted                  # auto-detect from git diff
#   npm run snapshots:targeted -- --verify      # compare only (no update)
#   npm run snapshots:targeted -- homepage      # explicit page name / grep
#   npm run snapshots:targeted -- "dark mode"   # explicit grep pattern
#   npm run snapshots:targeted -- --dry-run     # show what would run, don't run
#
# Examples (typical wall-clock times on a warm 4-CPU Colima VM):
#   homepage change     → ~5 tests / browser  → ~20s  (vs ~6 min full)
#   theme toggle change → ~8 tests / browser  → ~30s
#   mobile menu change  → ~9 tests / browser  → ~35s
#   CSS/layout change   → falls back to full regen (~2 min parallel)
#
# Requires the same Docker setup as scripts/visual-snapshots.sh.

set -euo pipefail
cd "$(dirname "$0")/.."

# ── Parse args ──────────────────────────────────────────────────────────────
UPDATE_FLAG="--update-snapshots"
DRY_RUN=false
EXPLICIT_PATTERN=""

for arg in "$@"; do
  case "$arg" in
    --verify)   UPDATE_FLAG="" ;;
    --dry-run)  DRY_RUN=true ;;
    --*)        ;; # ignore other flags
    *)          EXPLICIT_PATTERN="$arg" ;;
  esac
done

# ── Explicit pattern: skip git diff detection ────────────────────────────────
if [ -n "$EXPLICIT_PATTERN" ]; then
  echo "▶ Targeted: --grep '$EXPLICIT_PATTERN'"
  if $DRY_RUN; then
    echo "  (dry-run — would run: scripts/visual-snapshots.sh --project=chromium --project=firefox --project=webkit --grep='$EXPLICIT_PATTERN' $UPDATE_FLAG)"
    exit 0
  fi
  exec bash scripts/visual-snapshots.sh \
    --project=chromium --project=firefox --project=webkit \
    "--grep=$EXPLICIT_PATTERN" \
    ${UPDATE_FLAG:+"$UPDATE_FLAG"}
fi

# ── Auto-detect from git diff ────────────────────────────────────────────────
# Combine unstaged and staged changes relative to HEAD
CHANGED=$(
  { git diff --name-only HEAD 2>/dev/null; git diff --cached --name-only 2>/dev/null; } \
  | sort -u | grep -v '^$' || true
)

if [ -z "$CHANGED" ]; then
  echo "No changes detected vs HEAD."
  echo "Tip: use 'npm run snapshots' for a full regen, or pass a pattern:"
  echo "     npm run snapshots:targeted -- homepage"
  exit 0
fi

echo "Changed files:"
echo "$CHANGED" | sed 's/^/  /'
echo ""

# ── Map changed files to test patterns ──────────────────────────────────────
#
# Mapping rules (most specific wins; BROAD = need full regen):
#
#   assets/css/**                  → BROAD  (global styles, all pages affected)
#   assets/js/theme-toggle.js      → theme + dark mode tests
#   assets/js/mobile-menu.js       → mobile-menu tests
#   assets/js/**                   → BROAD  (unknown JS impact)
#   _layouts/homepage.html         → homepage tests
#   _layouts/post.html             → blog-post tests
#   _layouts/page.html             → about + talks tests
#   _layouts/default.html          → BROAD  (base layout, all pages)
#   _includes/head.html            → BROAD  (all pages)
#   _includes/body/sidebar.html    → BROAD  (sidebar on all pages)
#   _includes/body/footer.html     → pages that show full footer (tier 1)
#   _includes/theme_toggle.html    → theme + dark mode tests
#   _includes/search.html          → search tests (non-visual, safe to skip)
#   test-suite/tests/visual.spec.ts         → visual spec only
#   test-suite/tests/theme.spec.ts          → theme spec only
#   test-suite/tests/mobile-menu.spec.ts    → mobile-menu spec only
#   test-suite/tests/helpers/stabilize.ts   → BROAD (affects every screenshot)

BROAD=false
declare -A SEEN_PATTERNS  # deduplicate
PATTERNS=()

add_pattern() {
  local p="$1"
  if [ -z "${SEEN_PATTERNS[$p]+x}" ]; then
    SEEN_PATTERNS[$p]=1
    PATTERNS+=("$p")
  fi
}

while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  case "$f" in
    assets/css/*)
      BROAD=true ;;
    assets/js/theme-toggle.js)
      add_pattern "dark mode|theme toggle" ;;
    assets/js/mobile-menu.js)
      add_pattern "sidebar|mobile-menu|hamburger" ;;
    assets/js/*)
      BROAD=true ;;
    _layouts/homepage.html)
      add_pattern "homepage" ;;
    _layouts/post.html)
      add_pattern "blog-post" ;;
    _layouts/page.html)
      add_pattern "about|talks" ;;
    _layouts/default.html | _includes/head.html | _includes/body/sidebar.html)
      BROAD=true ;;
    _includes/body/footer.html)
      add_pattern "homepage|blog-index|archive" ;;
    _includes/theme_toggle.html)
      add_pattern "dark mode|theme toggle" ;;
    _includes/search.html)
      : ;; # search is non-visual; skip
    test-suite/tests/visual.spec.ts)
      add_pattern "@visual" ;;
    test-suite/tests/theme.spec.ts)
      add_pattern "Theme Functionality" ;;
    test-suite/tests/mobile-menu.spec.ts)
      add_pattern "Mobile Navigation" ;;
    test-suite/tests/helpers/stabilize.ts)
      BROAD=true ;;
    *)
      : ;; # non-visual file (posts, pages, _data, etc.) — no snapshot impact
  esac
done <<< "$CHANGED"

# ── Fall back to full regen if changes are too broad ────────────────────────
if $BROAD; then
  echo "⚠️  Global changes detected — full regen required."
  echo "   (Tip: isolate unrelated changes in separate commits for better targeting)"
  echo ""
  if $DRY_RUN; then
    echo "  (dry-run — would run: full regen across all 3 browsers in parallel)"
    exit 0
  fi
  exec bash scripts/visual-snapshots.sh \
    --project=chromium --project=firefox --project=webkit \
    ${UPDATE_FLAG:+"$UPDATE_FLAG"}
fi

if [ "${#PATTERNS[@]}" -eq 0 ]; then
  echo "✅ No visual tests affected by these changes — nothing to regen."
  echo "   Run 'npm run snapshots' to force a full regen."
  exit 0
fi

# ── Run targeted tests ───────────────────────────────────────────────────────
# Combine all patterns with | (Playwright grep treats this as regex OR)
GREP_PATTERN=$(IFS="|"; echo "${PATTERNS[*]}")
echo "Targeting: --grep '$GREP_PATTERN'"
echo ""

if $DRY_RUN; then
  echo "  (dry-run — would run: scripts/visual-snapshots.sh --project=chromium --project=firefox --project=webkit \"--grep=$GREP_PATTERN\" $UPDATE_FLAG)"
  exit 0
fi

exec bash scripts/visual-snapshots.sh \
  --project=chromium --project=firefox --project=webkit \
  "--grep=$GREP_PATTERN" \
  ${UPDATE_FLAG:+"$UPDATE_FLAG"}
