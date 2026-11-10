#!/usr/bin/env node
/**
 * Structural validation of built-site surfaces in _site/.
 *
 * Checks that user-visible surfaces which are rebuilt on every content push
 * exist and are well-formed: search.json, sitemap.xml, robots.txt, llms.txt
 * and 404.html. Assertions are deliberately structural (parses, non-empty,
 * fields the front end consumes), not exact-shape, so intentional format
 * changes do not cause false positives.
 *
 * Usage: node test-suite/scripts/validate-site-surfaces.js [siteDir]
 */
const fs = require('fs');
const path = require('path');
const { parseStringPromise } = require('xml2js');

const siteDir = path.resolve(
  process.argv[2] || path.join(__dirname, '../../_site'),
);
const errors = [];

function read(file) {
  const full = path.join(siteDir, file);
  if (!fs.existsSync(full)) {
    errors.push(`${file}: missing`);
    return null;
  }
  const text = fs.readFileSync(full, 'utf8');
  if (text.trim().length === 0) {
    errors.push(`${file}: empty`);
    return null;
  }
  return text;
}

// Fields assets/js/search.js reads from each entry: url (lunr ref and link),
// title, excerpt, date (rendered in results), content (indexed).
// categories and tags are guarded in the client, so they are not required.
const REQUIRED_STRING_FIELDS = ['url', 'title', 'date', 'excerpt', 'content'];

function validateSearch() {
  const text = read('search.json');
  if (text === null) return;
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    errors.push(`search.json: invalid JSON (${e.message})`);
    return;
  }
  if (!Array.isArray(data) || data.length === 0) {
    errors.push('search.json: expected a non-empty array');
    return;
  }
  const seen = new Set();
  data.forEach((entry, i) => {
    for (const field of REQUIRED_STRING_FIELDS) {
      if (typeof entry?.[field] !== 'string' || entry[field].trim() === '') {
        errors.push(`search.json[${i}]: missing or empty "${field}"`);
      }
    }
    if (typeof entry?.url === 'string') {
      if (seen.has(entry.url)) {
        errors.push(`search.json[${i}]: duplicate url ${entry.url}`);
      }
      seen.add(entry.url);
    }
  });
  console.log(`  search.json: ${data.length} entries`);
}

async function validateSitemap() {
  const text = read('sitemap.xml');
  if (text === null) return;
  let doc;
  try {
    doc = await parseStringPromise(text);
  } catch (e) {
    errors.push(`sitemap.xml: invalid XML (${e.message})`);
    return;
  }
  const urls = doc?.urlset?.url;
  if (!Array.isArray(urls) || urls.length === 0) {
    errors.push('sitemap.xml: no <url> entries');
    return;
  }
  const locs = urls.map((u) => (u.loc && u.loc[0]) || '');
  const posts = locs.filter((l) => /\/blog\/\d{4}\/\d{2}\/\d{2}\//.test(l));
  if (posts.length === 0) {
    errors.push('sitemap.xml: contains no post <loc> entries');
  }
  console.log(`  sitemap.xml: ${locs.length} urls, ${posts.length} posts`);
}

function validateText() {
  for (const file of ['robots.txt', 'llms.txt']) {
    if (read(file) !== null) console.log(`  ${file}: ok`);
  }
}

function validate404() {
  const text = read('404.html');
  if (text === null) return;
  if (!/Page Not Found/i.test(text) || !/class="error-page"/.test(text)) {
    errors.push(
      '404.html: missing marker content (Page Not Found, .error-page)',
    );
    return;
  }
  console.log('  404.html: ok');
}

async function main() {
  if (!fs.existsSync(siteDir)) {
    console.error(`❌ ${siteDir} not found. Build the site first.`);
    process.exit(1);
  }
  console.log('Validating site surfaces...');
  validateSearch();
  await validateSitemap();
  validateText();
  validate404();

  if (errors.length > 0) {
    console.error('❌ Site surface validation failed:');
    errors.forEach((e) => console.error(`   - ${e}`));
    process.exit(1);
  }
  console.log('✅ Site surfaces valid');
}

main();
