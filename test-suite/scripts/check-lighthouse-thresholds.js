#!/usr/bin/env node

/**
 * Checks that Lighthouse score thresholds have not decreased.
 * Compares thresholds in current branch vs main branch.
 * Exits with error if any threshold decreased.
 *
 * Usage: node check-lighthouse-thresholds.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = 'test-suite/configs/lighthouse.config.js';
const REPO_ROOT = path.join(__dirname, '../..');

/**
 * Extract category thresholds from lighthouse config content
 */
function extractThresholds(configContent) {
  const thresholds = {};

  // Match patterns like: "categories:performance": ["error", { minScore: 0.70 }]
  const regex =
    /"categories:(\w+)":\s*\["error",\s*{\s*minScore:\s*([\d.]+)\s*}\]/g;

  let match;
  while ((match = regex.exec(configContent)) !== null) {
    const category = match[1];
    const score = parseFloat(match[2]);
    thresholds[category] = score;
  }

  return thresholds;
}

/**
 * Get thresholds from a specific git ref
 */
function getThresholdsFromRef(ref) {
  try {
    const content = execSync(`git show ${ref}:${CONFIG_PATH}`, {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    });
    return extractThresholds(content);
  } catch (error) {
    // If file doesn't exist in ref, return empty thresholds
    return {};
  }
}

/**
 * Get current thresholds from working directory
 */
function getCurrentThresholds() {
  const configPath = path.join(REPO_ROOT, CONFIG_PATH);
  const content = fs.readFileSync(configPath, 'utf-8');
  return extractThresholds(content);
}

function main() {
  console.log('🔍 Checking Lighthouse score thresholds...\n');

  // Get base branch (main or master)
  let baseBranch;
  try {
    execSync('git show-ref --verify --quiet refs/heads/main', {
      cwd: REPO_ROOT,
    });
    baseBranch = 'main';
  } catch {
    baseBranch = 'master';
  }

  // Get thresholds from base branch
  const baseThresholds = getThresholdsFromRef(baseBranch);
  const currentThresholds = getCurrentThresholds();

  console.log(`Base branch (${baseBranch}) thresholds:`, baseThresholds);
  console.log('Current branch thresholds:', currentThresholds);
  console.log();

  // Check for decreases
  const decreases = [];
  for (const [category, baseScore] of Object.entries(baseThresholds)) {
    const currentScore = currentThresholds[category];

    if (currentScore === undefined) {
      decreases.push({
        category,
        base: baseScore,
        current: 'removed',
      });
    } else if (currentScore < baseScore) {
      decreases.push({
        category,
        base: baseScore,
        current: currentScore,
      });
    }
  }

  // Report results
  if (decreases.length === 0) {
    console.log('✅ All thresholds are maintained or improved!');
    process.exit(0);
  } else {
    console.error('❌ Lighthouse score thresholds have decreased:\n');
    decreases.forEach(({ category, base, current }) => {
      console.error(`  ${category}: ${base} → ${current}`);
    });
    console.error(
      '\n⚠️  Thresholds must never decrease. If scores have genuinely dropped:',
    );
    console.error('   1. Investigate and fix the performance regression');
    console.error('   2. Only after fixing, the threshold will naturally pass');
    console.error(
      '\n   To increase thresholds when scores improve, update lighthouse.config.js',
    );
    process.exit(1);
  }
}

main();
