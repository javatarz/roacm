module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:4000/",
        "http://localhost:4000/blog/2025/11/06/intelligent-engineering-building-skills-and-shaping-principles/",
      ],
      numberOfRuns: 3,
      startServerCommand: process.env.CI
        ? "bundle exec jekyll serve --host 0.0.0.0 --port 4000"
        : "./local_run.sh",
      startServerReadyPattern: process.env.CI
        ? "Server address"
        : "Server running",
      startServerReadyTimeout: 120000,
      settings: {
        preset: "desktop",
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
    assert: {
      // Use no preset - define all assertions explicitly for local dev
      assertions: {
        // Performance - relaxed for local development
        "first-contentful-paint": ["warn", { maxNumericValue: 3000 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.25 }],
        "total-blocking-time": ["warn", { maxNumericValue: 500 }],

        // Accessibility - keep these important
        "color-contrast": "warn",
        "heading-order": "warn",
        "image-alt": "warn",
        "meta-viewport": "warn",

        // Best Practices - relaxed for development
        "errors-in-console": "warn",
        "no-document-write": "warn",
        "js-libraries": "off",

        // SEO
        "document-title": "warn",
        "meta-description": "warn",
        "link-text": "warn",

        // Disable checks not applicable to local development
        "uses-http2": "off",
        "uses-long-cache-ttl": "off",
        "render-blocking-resources": "off",
        "is-on-https": "off", // Local dev is HTTP
        "redirects-http": "off",
        "unminified-css": "off", // Dev assets aren't minified
        "unminified-javascript": "off",
        "legacy-javascript": "off",
        "inspector-issues": "off",
        "lcp-lazy-loaded": "off",
        "non-composited-animations": "off",
        "prioritize-lcp-image": "off",
        "target-size": "off",
        "third-party-cookies": "off",
        "bf-cache": "off",

        // Theme-specific allowances
        "unsized-images": "off",
        "unused-css-rules": "off",
        "unused-javascript": "off",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./test-suite/reports/lighthouse",
    },
  },
};
