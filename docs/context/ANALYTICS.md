# Analytics

This document describes the analytics implementation for the ROACM blog.

## Platform

**Umami Analytics** - Privacy-focused, open-source analytics

- Hosted on: Vercel (`https://umami-javatarz.vercel.app`)
- Dashboard: https://umami-javatarz.vercel.app
- Website ID: `72210660-1862-4bd0-81b1-0bb5766381d8`
- Only loads in production environment

## Page View Tracking

Automatic page view tracking is enabled by default via the Umami script tag in `_includes/head.html`.

## Event Tracking

Custom events track meaningful user interactions beyond page views.

### Implementation

Event tracking uses the `UmamiTracker` utility (`assets/js/umami-tracker.js`):

- Safe wrapper around `umami.track()` API
- Graceful degradation when Umami not loaded (development mode)
- Property sanitization (max 100 chars, primitives only)
- Error handling with debug logging

### Tracked Events

| Event Name     | Description            | Properties                                            | Value                               |
| -------------- | ---------------------- | ----------------------------------------------------- | ----------------------------------- |
| `code-copy`    | User copies code block | `language` (javascript, python, etc.)                 | **High** - Direct utility indicator |
| `share`        | User shares content    | `platform` (twitter, linkedin, hackernews, copy-link) | **High** - Content virality measure |
| `search`       | User searches site     | `query` (search text), `results_count` (number)       | **High** - Content gap insights     |
| `toc-navigate` | User clicks ToC link   | `heading` (section title)                             | **Medium** - High-interest sections |
| `theme-toggle` | User toggles theme     | `theme` (light, dark)                                 | **Medium** - Preference insights    |

### Event Details

#### code-copy

**Trigger:** User clicks "Copy" button on code block and copy succeeds
**Location:** `assets/js/code-blocks.js`
**Properties:**

- `language`: Programming language extracted from code block class (`language-*` or `highlight-*`)
  - Examples: `javascript`, `python`, `bash`, `unknown`

**Use Cases:**

- Identify which programming languages are most referenced
- Measure practical utility of code examples
- Prioritize code snippet quality improvements

#### share

**Trigger:** User clicks share button (Twitter, LinkedIn, HN, or copy-link)
**Location:** `_includes/share_buttons.html`
**Properties:**

- `platform`: Share destination
  - `twitter` - X (Twitter) intent link
  - `linkedin` - LinkedIn share dialog
  - `hackernews` - Hacker News submit form
  - `copy-link` - Copy link to clipboard button

**Implementation:**

- External links: `data-umami-event` attribute (declarative)
- Copy-link button: Programmatic tracking (stays on page)

**Use Cases:**

- Identify which platforms drive engagement
- Measure content virality
- Optimize share button placement/visibility

#### search

**Trigger:** User performs search and results are displayed
**Location:** `assets/js/search.js`
**Properties:**

- `query`: User's search text (sanitized to 100 chars max)
- `results_count`: Number of matching posts

**Behavior:**

- Only tracks searches with results (not "no results" searches)
- Query is already trimmed and validated by search function

**Use Cases:**

- Understand what readers are looking for
- Identify content gaps
- Improve content discoverability
- Enhance search relevance

#### toc-navigate

**Trigger:** User clicks a Table of Contents link
**Location:** `assets/js/toc.js`
**Properties:**

- `heading`: The section heading text user clicked

**Behavior:**

- Tracked before smooth scroll navigation
- Only fires on intentional clicks (not scroll-based highlighting)

**Use Cases:**

- Identify most-accessed sections
- Understand reading patterns (jump to specific sections vs linear reading)
- Prioritize high-interest topics
- Optimize content structure

#### theme-toggle

**Trigger:** User clicks theme toggle button
**Location:** `_includes/theme_toggle.html`
**Properties:**

- `theme`: Selected theme (`light` or `dark`)

**Behavior:**

- Tracks after theme change completes
- Captures new theme preference (not the toggle action itself)
- Does NOT track automatic system preference changes

**Use Cases:**

- Understand user theme preferences
- Validate default theme choice
- Inform design decisions

## Dashboard Access

1. Navigate to https://umami-javatarz.vercel.app
2. Log in with Umami credentials
3. Select "ROACM" website from dashboard
4. View:
   - **Events** tab: Event names, counts, and trend graphs
   - Click event name to see property breakdown
   - **Realtime** tab: Live visitor activity
   - **Pages** tab: Most visited pages

## Development Testing

Since Umami only loads in production (`jekyll.environment == 'production'`), test event tracking using:

### Option 1: Mock Umami in Browser Console

```javascript
window.umami = {
  track: function (eventName, props) {
    console.log('[MOCK Umami]', eventName, props);
  },
};
```

### Option 2: Local Production Build

```bash
JEKYLL_ENV=production bundle exec jekyll serve
```

### Option 3: Staging Deployment

Deploy to a staging branch with production environment enabled.

## Verification Checklist

- [ ] Code copy: Copy different language blocks, verify `language` property
- [ ] Share buttons: Click each platform, verify `platform` property
- [ ] Copy link: Use copy-link button, verify `copy-link` platform
- [ ] Search: Search with results, verify `query` and `results_count`
- [ ] ToC: Click different ToC links, verify `heading` text
- [ ] Theme toggle: Toggle between themes, verify `theme` property

## Privacy Considerations

- **No PII collected**: Events track actions, not user identities
- **Query sanitization**: Search queries truncated to 100 chars
- **Umami is privacy-focused**: No cookies, GDPR compliant, no cross-site tracking
- **Production only**: No tracking in development environment

## Maintenance

### Adding New Events

1. Choose descriptive event name (kebab-case, e.g., `button-click`)
2. Add tracking call using `UmamiTracker.track()`:
   ```javascript
   if (window.UmamiTracker) {
     window.UmamiTracker.track('event-name', {
       property: 'value',
     });
   }
   ```
3. Update this documentation with event details
4. Rebuild bundle: `npm run build:js`
5. Test in production build
6. Verify in Umami dashboard

### Removing Events

1. Remove or comment out `UmamiTracker.track()` call
2. Rebuild bundle: `npm run build:js`
3. Update this documentation
4. Events will stop appearing in dashboard (historical data retained)

## Troubleshooting

### Events not appearing in dashboard

1. Verify production environment: `jekyll.environment == 'production'`
2. Check Umami script loaded: Open DevTools → Network → Filter for `script.js`
3. Test Umami API directly:
   ```javascript
   console.log(typeof window.umami); // Should be 'object'
   window.umami.track('test-event', { test: 'value' });
   ```
4. Check browser console for errors
5. Verify website ID matches Umami config (see `_config.yml`)

### Event tracking breaks functionality

- All tracking wrapped in try-catch or graceful checks
- If issues persist, remove `umami-tracker.js` from bundle script in `package.json`
- Comment out specific event tracking calls to isolate issue

## Related Files

- `assets/js/umami-tracker.js` - Core tracking utility
- `assets/js/code-blocks.js` - Code copy tracking
- `assets/js/search.js` - Search tracking
- `assets/js/toc.js` - ToC navigation tracking
- `_includes/share_buttons.html` - Share tracking
- `_includes/theme_toggle.html` - Theme toggle tracking
- `_includes/head.html` - Umami script loader
- `_config.yml` - Umami configuration
- `package.json` - Bundle build configuration
