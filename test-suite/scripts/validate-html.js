#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const HTMLHint = require('htmlhint').HTMLHint;

// Load HTMLHint configuration
const configPath = path.join(__dirname, '../configs/htmlhint.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Build Jekyll site first to get generated HTML
console.log('🏗️  Building Jekyll site for HTML validation...');

// Detect CI environment
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

// Check if _site directory already exists with recent content
const siteDir = path.join(__dirname, '../../_site');
if (fs.existsSync(siteDir)) {
  const stats = fs.statSync(siteDir);
  const minutesOld = (new Date() - stats.mtime) / 1000 / 60;

  if (minutesOld < 60) {
    console.log('ℹ️  Using existing _site directory (less than 1 hour old)');
  } else if (isCI) {
    console.error(
      '❌ _site directory is stale in CI. Jekyll build may have failed.'
    );
    process.exit(1);
  } else {
    console.log(
      '⚠️  _site directory is old. Please rebuild Jekyll site manually.'
    );
    console.log('   Run: ./local_run.sh in another terminal');
    process.exit(0); // Exit gracefully for local dev
  }
} else if (isCI) {
  console.error(
    '❌ No _site directory found in CI. Jekyll build step is required.'
  );
  console.error(
    '   Add "bundle exec jekyll build" before running HTML validation.'
  );
  process.exit(1);
} else {
  console.log('⚠️  No _site directory found. Jekyll site needs to be built.');
  console.log('   Run: ./local_run.sh to start the Jekyll server');
  console.log('   HTML validation will be skipped for now.');
  process.exit(0); // Exit gracefully for local dev
}

// Find all HTML files in _site directory
const htmlFiles = [];

function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findHtmlFiles(filePath);
    } else if (file.endsWith('.html')) {
      htmlFiles.push(filePath);
    }
  }
}

findHtmlFiles(siteDir);

console.log(`📋 Validating ${htmlFiles.length} HTML files...`);

let hasErrors = false;
const errors = [];

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const messages = HTMLHint.verify(content, config);

  if (messages.length > 0) {
    const relativePath = path.relative(siteDir, file);
    errors.push({
      file: relativePath,
      messages: messages,
    });
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('\n❌ HTML validation errors found:\n');

  for (const error of errors) {
    console.error(`📄 ${error.file}:`);
    for (const msg of error.messages) {
      console.error(
        `   Line ${msg.line}:${msg.col} - ${msg.message} (${msg.rule.id})`
      );
    }
    console.error('');
  }

  process.exit(1);
} else {
  console.log('✅ All HTML files are valid!');
}
