/**
 * Lighthouse CI configuration for threshold checking.
 * Runs 10 times for statistical confidence (vs 3 in main CI config).
 * No assertions - this is for data collection only.
 */
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4000/',
        'http://localhost:4000/blog/2025/11/06/intelligent-engineering-building-skills-and-shaping-principles/',
      ],
      numberOfRuns: 10, // High confidence for threshold decisions
      startServerCommand: process.env.CI
        ? 'bundle exec jekyll serve --host 0.0.0.0 --port 4000 --config _config.yml,_config_dev.yml'
        : './local_run_native.sh --no-livereload',
      startServerReadyPattern: 'Server running',
      startServerReadyTimeout: 120000,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    // No assertions - we're collecting data, not blocking
    upload: {
      target: 'filesystem',
      outputDir: './test-suite/reports/lighthouse-threshold-check',
    },
  },
};
