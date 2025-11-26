# ROACM Theme Testing Suite

A comprehensive automated testing framework for the ROACM Jekyll blog theme, ensuring visual consistency, functionality, accessibility, and performance across all changes.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Ruby 3.0+
- Docker (for local Jekyll server)

### Installation

```bash
# Install Node dependencies
npm install

# Install Ruby dependencies
bundle install

# Initialize Husky for pre-commit hooks
npm run prepare
```

## 📋 Test Structure

```
test-suite/
├── configs/           # Test tool configurations
│   ├── eslint.config.json
│   ├── htmlhint.config.json
│   ├── lighthouse.config.js
│   ├── playwright.config.ts
│   └── stylelint.config.json
├── scripts/           # Test helper scripts
│   └── validate-html.js
├── tests/            # Test files
│   └── theme.spec.ts
└── reports/          # Generated test reports (gitignored)
    ├── lighthouse/
    ├── playwright-html/
    └── playwright-results/
```

## 🧪 Available Tests

### Unit Tests (Linting & Validation)

```bash
# Run all unit tests
npm run test:unit

# Individual linters
npm run lint:css    # Stylelint for CSS
npm run lint:js     # ESLint for JavaScript
npm run lint:html   # HTMLHint for generated HTML
```

### E2E & Visual Tests

```bash
# Run all E2E tests
npm run test:e2e

# Visual regression tests only
npm run test:visual

# Accessibility tests only
npm run test:a11y

# Run tests for specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
npm run test:e2e -- --project=mobile-chrome
npm run test:e2e -- --project=macbook-pro-14
```

### Performance Tests

```bash
# Run Lighthouse CI
npm run test:lighthouse
```

### Run Everything

```bash
# Run all tests (unit + E2E)
npm test
```

## 🔍 Test Coverage

### Visual & Functional Tests
- ✅ Theme toggle (light/dark mode switching)
- ✅ Theme persistence (localStorage)
- ✅ CSS variable application
- ✅ Reading progress bar tracking
- ✅ Back-to-top button functionality
- ✅ Code block copy button
- ✅ Responsive layouts (desktop, tablet, mobile, MacBook Pro 14")
- ✅ No horizontal scrolling at any viewport
- ✅ Visual regression screenshots

### Accessibility Tests
- ✅ WCAG AA compliance
- ✅ Color contrast validation
- ✅ Keyboard navigation
- ✅ ARIA labels and roles
- ✅ Focus indicators
- ✅ Heading hierarchy

### Performance Tests
- ✅ First Contentful Paint < 2s
- ✅ Largest Contentful Paint < 2.5s
- ✅ Cumulative Layout Shift < 0.1
- ✅ Total Blocking Time < 300ms
- ✅ No console errors
- ✅ SEO best practices

### Code Quality
- ✅ CSS property order
- ✅ CSS variable naming conventions
- ✅ JavaScript best practices
- ✅ HTML5 validation
- ✅ Proper indentation and formatting

## 🎣 Pre-commit Hooks

Automatic checks run before each commit:

1. **Quick Linting** (always runs)
   - CSS files → Stylelint
   - JS files → ESLint
   - All files → Prettier formatting

2. **Conditional Testing** (based on changed files)
   - CSS changes → Visual regression tests
   - JS changes → Functionality tests

To bypass hooks in emergency:
```bash
git commit --no-verify -m "Emergency fix"
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/theme-tests.yml` workflow runs on:
- Push to `main` branch
- Pull requests to `main`
- Only when theme files change

### Pipeline Stages

1. **Lint & Validate** ✓
   - CSS, JS, HTML validation
   - Runs first, fails fast

2. **Visual & E2E Tests** ✓
   - Runs in parallel for Chrome, Firefox, Safari
   - Captures screenshots on failure

3. **Accessibility Tests** ✓
   - Full WCAG compliance check
   - Both light and dark modes

4. **Performance Tests** ✓
   - Lighthouse CI benchmarks
   - Comments results on PRs

## 📊 Viewing Test Results

### Local Development

```bash
# Open Playwright HTML report
npx playwright show-report test-suite/reports/playwright-html

# View Lighthouse results
open test-suite/reports/lighthouse/index.html
```

### CI/CD

Test results are uploaded as artifacts:
- `playwright-report-{browser}` - E2E test results
- `playwright-screenshots-{browser}` - Failed test screenshots
- `accessibility-report` - A11y test results
- `lighthouse-report` - Performance metrics

## 🎯 Testing Best Practices

### Before Making Theme Changes

1. **Baseline Screenshots**: Run visual tests to capture current state
   ```bash
   npm run test:visual -- --update-snapshots
   ```

2. **Performance Baseline**: Record current Lighthouse scores
   ```bash
   npm run test:lighthouse
   ```

### After Making Changes

1. **Local Testing**: Always test locally first
   ```bash
   npm test
   ```

2. **Cross-browser Check**: Test in multiple browsers
   ```bash
   npm run test:e2e
   ```

3. **Accessibility Validation**: Ensure no regressions
   ```bash
   npm run test:a11y
   ```

## 🐛 Troubleshooting

### Common Issues

**Docker not running:**
```bash
# Start Docker/Colima
colima start
```

**Port 4000 in use:**
```bash
# Find and kill process
lsof -i :4000
kill -9 [PID]
```

**Playwright browsers not installed:**
```bash
npx playwright install
```

**Visual tests failing due to minor differences:**
```bash
# Update baseline screenshots
npm run test:visual -- --update-snapshots
```

## 📝 Writing New Tests

### Adding a Visual Test

```typescript
test('new component renders correctly @visual', async ({ page }) => {
  await page.goto('/page-with-component');

  const component = page.locator('.my-component');
  await expect(component).toHaveScreenshot('component-name.png');
});
```

### Adding an Accessibility Test

```typescript
test('new feature is accessible @a11y', async ({ page }) => {
  await page.goto('/feature-page');
  await injectAxe(page);

  await checkA11y(page, '.feature-selector', {
    detailedReport: true
  });
});
```

## 🔧 Configuration

### Adjusting Test Thresholds

Edit configurations in `test-suite/configs/`:

- **Lighthouse scores**: `lighthouse.config.js`
- **Viewport sizes**: `playwright.config.ts`
- **Linting rules**: `eslint.config.json`, `stylelint.config.json`

### Adding Test URLs

Update `lighthouse.config.js` and test files to include new pages:

```javascript
url: [
  'http://localhost:4000/',
  'http://localhost:4000/new-page.html',
]
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Lighthouse CI Docs](https://github.com/GoogleChrome/lighthouse-ci)
- [Axe Accessibility Testing](https://www.deque.com/axe/)
- [Stylelint Rules](https://stylelint.io/user-guide/rules)
- [ESLint Rules](https://eslint.org/docs/rules/)

## 🤝 Contributing

When adding new theme features:

1. Write tests FIRST (TDD approach)
2. Ensure all existing tests pass
3. Add visual regression tests for UI changes
4. Include accessibility tests for interactive elements
5. Update this README if adding new test categories

## 📄 License

This testing suite is part of the ROACM blog project.