#!/usr/bin/env node

/**
 * Analyzes Lighthouse results and proposes threshold updates.
 * Reads scores from threshold-check run, compares to current thresholds,
 * and outputs JSON with PR details if updates are recommended.
 *
 * Usage: node propose-threshold-updates.js
 * Output: JSON to stdout (for GitHub Actions)
 */

const fs = require('fs');
const path = require('path');

const REPORT_DIR = 'test-suite/reports/lighthouse-threshold-check';
const CONFIG_PATH = 'test-suite/configs/lighthouse.config.js';
const REPO_ROOT = path.join(__dirname, '../..');

// Configuration
const IMPROVEMENT_THRESHOLD = 0.03; // Minimum improvement to trigger update
const SAFETY_BUFFER = 0.03; // Subtract from median for new threshold

// Categories to track (excludes best-practices which can return null)
const TRACKED_CATEGORIES = ['performance', 'accessibility', 'seo'];

/**
 * Extract category thresholds from lighthouse config content
 */
function extractThresholds(configContent) {
  const thresholds = {};
  // Match both single and double quoted category assertions
  const regex =
    /['"]categories:(\w+)['"]\s*:\s*\[['"]error['"]\s*,\s*\{\s*minScore\s*:\s*([\d.]+)\s*\}\]/g;

  let match;
  while ((match = regex.exec(configContent)) !== null) {
    const category = match[1];
    const score = parseFloat(match[2]);
    thresholds[category] = score;
  }

  return thresholds;
}

/**
 * Calculate median of an array of numbers
 */
function median(numbers) {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Read Lighthouse results and calculate median scores per category
 */
function getMedianScores() {
  const manifestPath = path.join(REPO_ROOT, REPORT_DIR, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // Collect scores per category across all runs
  const scoresByCategory = {};
  TRACKED_CATEGORIES.forEach((cat) => (scoresByCategory[cat] = []));

  for (const entry of manifest) {
    if (entry.summary) {
      TRACKED_CATEGORIES.forEach((cat) => {
        const score = entry.summary[cat];
        if (score !== null && score !== undefined) {
          scoresByCategory[cat].push(score);
        }
      });
    }
  }

  // Calculate median for each category
  const medianScores = {};
  TRACKED_CATEGORIES.forEach((cat) => {
    medianScores[cat] = median(scoresByCategory[cat]);
  });

  return medianScores;
}

/**
 * Get current thresholds from config file
 */
function getCurrentThresholds() {
  const configPath = path.join(REPO_ROOT, CONFIG_PATH);
  const content = fs.readFileSync(configPath, 'utf-8');
  return extractThresholds(content);
}

/**
 * Round to 2 decimal places
 */
function round2(num) {
  return Math.round(num * 100) / 100;
}

/**
 * Update thresholds in the config file
 */
function applyUpdates(updates) {
  const configPath = path.join(REPO_ROOT, CONFIG_PATH);
  let content = fs.readFileSync(configPath, 'utf-8');

  updates.forEach((update) => {
    // Match the threshold line and replace with new value (supports single or double quotes)
    const regex = new RegExp(
      `(['"]categories:${update.category}['"]\\s*:\\s*\\[['"]error['"]\\s*,\\s*\\{\\s*minScore\\s*:\\s*)([\\d.]+)(\\s*\\}\\])`,
    );
    content = content.replace(regex, `$1${update.proposed}$3`);
  });

  fs.writeFileSync(configPath, content);
  console.error(`Updated ${CONFIG_PATH} with new thresholds`);
}

/**
 * Generate PR body with score details
 */
function generatePrBody(updates, medianScores, currentThresholds) {
  let body = '## Summary\n\n';

  updates.forEach((u) => {
    body += `- **${u.category}**: median (${round2(u.median)}) exceeds threshold (${u.current}) by +${round2(u.median - u.current)}\n`;
    body += `  - New threshold: ${round2(u.median)} - ${SAFETY_BUFFER} buffer = **${u.proposed}**\n`;
  });

  body += '\n## All Category Scores\n\n';
  body +=
    '| Category | Current Threshold | Median Score | Improvement | Action |\n';
  body +=
    '|----------|------------------|--------------|-------------|--------|\n';

  TRACKED_CATEGORIES.forEach((cat) => {
    const current = currentThresholds[cat] || 0;
    const med = medianScores[cat] || 0;
    const improvement = round2(med - current);
    const update = updates.find((u) => u.category === cat);
    const action = update ? `Update to ${update.proposed}` : 'No change';

    body += `| ${cat} | ${current} | ${round2(med)} | +${improvement} | ${action} |\n`;
  });

  body += '\n## Test plan\n\n';
  body += '- [ ] Review the median scores above\n';
  body += '- [ ] Verify no recent changes could affect performance\n';
  body += '- [ ] Merge when ready\n';
  body += '\n---\n';
  body += 'Generated with [Claude Code](https://claude.com/claude-code)\n';

  return body;
}

function main() {
  const args = process.argv.slice(2);
  const applyMode = args.includes('--apply');

  const medianScores = getMedianScores();
  const currentThresholds = getCurrentThresholds();

  // Find categories that should be updated
  const updates = [];

  TRACKED_CATEGORIES.forEach((category) => {
    const current = currentThresholds[category];
    const med = medianScores[category];

    if (current === undefined || med === undefined) return;

    const improvement = med - current;

    if (improvement >= IMPROVEMENT_THRESHOLD) {
      const proposed = round2(med - SAFETY_BUFFER);
      // Only update if proposed is actually higher than current
      if (proposed > current) {
        updates.push({
          category,
          current,
          median: med,
          proposed,
        });
      }
    }
  });

  // If --apply flag is set, update the config file
  if (applyMode) {
    if (updates.length > 0) {
      applyUpdates(updates);
    }
    return;
  }

  // Build detailed analysis for all categories
  const analysis = TRACKED_CATEGORIES.map((category) => {
    const current = currentThresholds[category] || 0;
    const med = medianScores[category] || 0;
    const improvement = round2(med - current);
    const requiredImprovement = IMPROVEMENT_THRESHOLD;
    const update = updates.find((u) => u.category === category);

    let reason;
    if (update) {
      reason = `Median ${round2(med)} exceeds threshold ${current} by +${improvement} (≥ ${requiredImprovement} required). New threshold: ${update.proposed}`;
    } else if (improvement < requiredImprovement) {
      reason = `Improvement +${improvement} is below required +${requiredImprovement}`;
    } else {
      reason = `No update needed`;
    }

    return {
      category,
      currentThreshold: current,
      medianScore: round2(med),
      improvement: `+${improvement}`,
      action: update ? `Update to ${update.proposed}` : 'No change',
      reason,
    };
  });

  // Generate output (default mode)
  if (updates.length === 0) {
    const output = {
      shouldUpdate: false,
      message: 'No threshold updates needed',
      summary: `All categories are within ${IMPROVEMENT_THRESHOLD * 100}% of current thresholds`,
      analysis,
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // Build PR title
  const titleParts = updates.map(
    (u) => `${u.category} ${u.current} → ${u.proposed}`,
  );
  const prTitle = `Update Lighthouse thresholds: ${titleParts.join(', ')}`;

  // Build commit message
  const commitMessage = prTitle;

  const output = {
    shouldUpdate: true,
    prTitle,
    prBody: generatePrBody(updates, medianScores, currentThresholds),
    commitMessage,
    updates,
    analysis,
  };

  console.log(JSON.stringify(output, null, 2));
}

main();
