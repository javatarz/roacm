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

// Run PurgeCSS to detect unused CSS
const purgeCSSResults = await new PurgeCSS().purge({
  content: ['_site/**/*.html', '_site/assets/js/**/*.js'],
  css: ['_site/assets/css/style.css'],
  safelist: purgeSafelist,
  rejected: true,
  rejectedCss: true,
});

// Report rejected selectors
const rejected = purgeCSSResults[0]?.rejected || [];
if (rejected.length > 0) {
  console.error('❌ Unused CSS detected:');
  rejected.forEach((sel) => console.error(`  - ${sel}`));
  process.exit(1);
}

console.log('✅ No unused CSS');
