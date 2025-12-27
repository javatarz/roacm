# Theme Testing Quick Start Guide

## 🚀 One-Command Setup

Set up the entire testing infrastructure with a single command:

```bash
./scripts/setup.sh
```

This will:

- ✅ Check all prerequisites (Node.js, Ruby, Git)
- ✅ Install all dependencies
- ✅ Install test browsers (Chrome, Firefox, Safari)
- ✅ Configure Git pre-commit hooks
- ✅ Create initial visual regression baselines
- ✅ Verify the installation

## 📋 Prerequisites

The setup script will check for these, but you need:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Ruby 3.0+** - [Download](https://www.ruby-lang.org/)
- **Git** - [Download](https://git-scm.com/)
- **Docker** (optional but recommended) - [Download](https://www.docker.com/)

## 🧪 Running Tests

After setup, you can run tests with:

```bash
# Run all tests
npm test

# Run specific test types
npm run test:visual   # Visual regression tests
npm run test:a11y     # Accessibility tests
npm run test:e2e      # End-to-end tests
npm run test:unit     # Linting and validation

# Use the convenient test runner
./test-suite/run-tests.sh --help
```

## 🎣 Pre-commit Hooks

Pre-commit hooks are automatically configured. They will:

- Lint CSS and JavaScript files
- Run visual tests if CSS changes
- Run functionality tests if JS changes

To bypass hooks in an emergency:

```bash
git commit --no-verify -m "Emergency fix"
```

## 📚 Full Documentation

For detailed information about the testing infrastructure, see:

- [Test Suite Documentation](test-suite/README.md)

## 🔧 Troubleshooting

### Setup Issues

If the setup script fails:

1. **Missing Prerequisites**

   ```bash
   # Install Node.js via nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20

   # Install Ruby via rbenv
   brew install rbenv
   rbenv install 3.2.0
   ```

2. **Permission Errors**

   ```bash
   # Make sure scripts are executable
   chmod +x scripts/setup.sh
   chmod +x test-suite/run-tests.sh
   chmod +x local_run_native.sh
   ```

3. **Port 4000 Already in Use**
   ```bash
   # Find and stop the process
   lsof -i :4000
   kill -9 [PID]
   ```

### Test Failures

1. **Visual Test Failures**

   ```bash
   # Update baselines if changes are intentional
   ./test-suite/run-tests.sh -t visual -u
   ```

2. **Timeout Errors**

   ```bash
   # Make sure Jekyll server starts properly
   ./local_run_native.sh
   # Then run tests in another terminal
   npm test
   ```

3. **Browser Installation Issues**
   ```bash
   # Reinstall Playwright browsers
   npx playwright install --with-deps
   ```

## 🆘 Getting Help

If you encounter issues:

1. Check the [Test Suite README](test-suite/README.md) for detailed documentation
2. Review the error messages - they usually indicate what's wrong
3. Make sure all prerequisites are installed with correct versions
4. Try running `./scripts/setup.sh` again to fix any missing components

## 🎯 Testing Philosophy

Our testing approach ensures:

- **No visual regressions** - Every pixel is verified
- **Accessibility for all** - WCAG AA compliance
- **Performance matters** - Core Web Vitals monitoring
- **Clean code** - Consistent style via linting
- **Cross-browser support** - Tests run on all major browsers

Remember: **Write tests first, then code!** (TDD approach)
