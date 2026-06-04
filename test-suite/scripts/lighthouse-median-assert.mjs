#!/usr/bin/env node
/**
 * Reads per-shard LHCI reports from lhci-shards/, computes per-URL median scores,
 * and asserts against thresholds from lighthouse.config.js.
 *
 * Each shard ran `lhci collect --numberOfRuns=1` on a separate runner (true CPU
 * isolation). This job collects the 3 runs, takes the median, then asserts —
 * equivalent to numberOfRuns:3 on one machine but with better isolation.
 *
 * Run from repo root: node test-suite/scripts/lighthouse-median-assert.mjs
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, basename } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const config = require('../configs/lighthouse.config.js');
const assertions = config.ci.assert.assertions;

const SHARDS_DIR = 'lhci-shards';

if (!existsSync(SHARDS_DIR)) {
  console.error(`❌ ${SHARDS_DIR}/ not found. Run from repo root after downloading shard artifacts.`);
  process.exit(1);
}

// Collect all LHR reports grouped by URL
const lhrsByUrl = new Map();
let totalRuns = 0;

for (const shardName of readdirSync(SHARDS_DIR).sort()) {
  const shardDir = join(SHARDS_DIR, shardName);
  if (!statSync(shardDir).isDirectory()) continue;

  const manifestPath = join(shardDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.warn(`⚠️  No manifest.json in ${shardDir}, skipping`);
    continue;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  for (const entry of manifest) {
    // manifest.json may contain absolute paths from the original runner — use basename only
    const lhrPath = join(shardDir, basename(entry.jsonPath));
    if (!existsSync(lhrPath)) {
      console.warn(`⚠️  Missing LHR: ${lhrPath}`);
      continue;
    }
    const lhr = JSON.parse(readFileSync(lhrPath, 'utf-8'));
    const url = lhr.requestedUrl || lhr.finalUrl;
    if (!lhrsByUrl.has(url)) lhrsByUrl.set(url, []);
    lhrsByUrl.get(url).push(lhr);
    totalRuns++;
  }
}

if (lhrsByUrl.size === 0) {
  console.error('❌ No LHR reports found in shards');
  process.exit(1);
}

const shardCount = readdirSync(SHARDS_DIR).filter(n => statSync(join(SHARDS_DIR, n)).isDirectory()).length;
console.log(`Loaded ${totalRuns} runs from ${shardCount} shards across ${lhrsByUrl.size} URLs\n`);

function median(values) {
  const nums = values.filter(v => v !== null && v !== undefined);
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

let failed = false;

for (const [url, lhrs] of lhrsByUrl) {
  console.log(`📊 ${url} (${lhrs.length} runs)`);

  for (const [key, assertion] of Object.entries(assertions)) {
    if (!assertion || assertion === 'off') continue;
    const [level, opts = {}] = Array.isArray(assertion) ? assertion : [assertion, {}];
    if (level === 'off') continue;

    let pass = true;
    let detail = '';
    let relevant = false;

    if (key.startsWith('categories:')) {
      const cat = key.slice('categories:'.length);
      if (!lhrs[0]?.categories?.[cat]) continue;
      const scores = lhrs.map(l => l.categories[cat]?.score ?? null);
      const med = median(scores);
      if (med === null || opts.minScore == null) continue;
      relevant = true;
      pass = med >= opts.minScore;
      detail = `score=${(med * 100).toFixed(1)} (min ${(opts.minScore * 100).toFixed(0)})`;
    } else {
      if (!lhrs[0]?.audits?.[key]) continue;

      if (opts.maxNumericValue != null) {
        const nums = lhrs.map(l => l.audits[key]?.numericValue ?? null);
        const med = median(nums);
        if (med === null) continue;
        relevant = level === 'error';
        pass = med <= opts.maxNumericValue;
        detail = `${med.toFixed(0)}ms (max ${opts.maxNumericValue}ms)`;
      } else {
        const scores = lhrs.map(l => l.audits[key]?.score ?? null);
        const med = median(scores);
        if (med === null) continue;
        relevant = level === 'error';
        pass = med >= 1;
        detail = `score=${med.toFixed(2)}`;
      }
    }

    const icon = pass ? '✅' : (level === 'error' ? '❌' : '⚠️');
    // Always print category scores; only print audit failures (to keep output concise)
    if (key.startsWith('categories:') || !pass) {
      console.log(`  ${icon} ${key}: ${detail}`);
    }
    if (!pass && level === 'error') failed = true;
  }
  console.log('');
}

if (failed) {
  console.error('❌ Lighthouse median assertions failed');
  process.exit(1);
}
console.log('✅ All error-level assertions passed (median across shards)');
