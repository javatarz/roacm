#!/usr/bin/env node

import { PurgeCSS } from 'purgecss';
import fs from 'fs';

// Load safelist from config
const safelist = JSON.parse(
  fs.readFileSync('config/dead-code-safelist.json', 'utf8')
);

// Build safelist for PurgeCSS
const purgeSafelist = {
  standard: [
    ...(safelist.css.classes || []),
    ...(safelist.css.elements || []),
  ],
  deep: [],
  greedy: (safelist.css.patterns || []).map((pattern) => new RegExp(pattern)),
};

// All stylesheets shipped to the browser, not just the theme's style.css.
// overrides.css carries the bulk of our customizations and must be audited too.
const cssFiles = [
  '_site/assets/css/style.css',
  '_site/assets/css/overrides.css',
];

// Run PurgeCSS to detect unused CSS
const purgeCSSResults = await new PurgeCSS().purge({
  content: ['_site/**/*.html', '_site/assets/js/**/*.js'],
  css: cssFiles,
  safelist: purgeSafelist,
  rejected: true,
  rejectedCss: true,
});

// Report rejected selectors, grouped by file
const rejected = purgeCSSResults.flatMap((result) =>
  (result.rejected || []).map((sel) => ({
    file: (result.file || '').split('/').pop(),
    sel,
  }))
);
if (rejected.length > 0) {
  console.error('❌ Unused CSS detected:');
  rejected.forEach(({ file, sel }) => console.error(`  - [${file}] ${sel}`));
  process.exit(1);
}

console.log('✅ No unused CSS');
