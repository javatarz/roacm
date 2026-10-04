#!/usr/bin/env node
// Checks the built /talks/ page against _data/speaking.yml (the source of truth):
// every talk renders once, links to the right place, and shows a thumbnail
// exactly when it has both a link and a thumbnail source.
// Reads the built site from $SITE_DIR (default: _site). No browser needed.

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const root = path.join(__dirname, '../..');
const siteDir = process.env.SITE_DIR || path.join(root, '_site');

const talks = matter.engines.yaml.parse(
  fs.readFileSync(path.join(root, '_data/speaking.yml'), 'utf8'),
);
const html = fs.readFileSync(path.join(siteDir, 'talks/index.html'), 'utf8');

const unescape = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

// One block per timeline entry (year headers use a different class)
const blocks = html
  .split('<li class="talk-timeline__item">')
  .slice(1)
  .map((b) => b.slice(0, b.indexOf('</li>')));

// Rendered as "Oct 2026" from the talk's top-level date (the primary delivery)
const dateLabel = (d) => {
  const date = new Date(d);
  const month = date.toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
  return `${month} ${date.getUTCFullYear()}`;
};

const errors = [];
const claimed = new Set();

if (blocks.length !== talks.length) {
  errors.push(`Expected ${talks.length} talk entries, found ${blocks.length}`);
}

for (const talk of talks) {
  // Titles repeat across talks (same talk, different year), so match on date too
  const block = blocks.find(
    (b) =>
      !claimed.has(b) &&
      unescape(b).includes(talk.title) &&
      b.includes(`talk-timeline__date">${dateLabel(talk.date)}<`),
  );
  if (!block) {
    errors.push(`"${talk.title}" (${dateLabel(talk.date)}): not rendered`);
    continue;
  }
  claimed.add(block);

  const link = talk.video_id
    ? `https://www.youtube.com/watch?v=${talk.video_id}`
    : (talk.deliveries || []).find((d) => d.url)?.url;
  const wantsThumb = Boolean(link && (talk.video_id || talk.image));
  const thumb = block.match(
    /<a class="talk-timeline__thumb" href="([^"]*)"[\s\S]*?<\/a>/,
  );

  if (!wantsThumb) {
    if (thumb) errors.push(`"${talk.title}": unexpected thumbnail`);
    continue;
  }
  if (!thumb) {
    errors.push(`"${talk.title}": missing thumbnail`);
    continue;
  }
  if (thumb[1] !== link) {
    errors.push(
      `"${talk.title}": thumbnail links to ${thumb[1]}, expected ${link}`,
    );
  }
  if (talk.video_id) {
    if (
      !thumb[0].includes(`img.youtube.com/vi/${talk.video_id}/hqdefault.jpg`)
    ) {
      errors.push(`"${talk.title}": thumbnail is not the YouTube frame`);
    }
    if (!thumb[0].includes('talk-card-play')) {
      errors.push(`"${talk.title}": missing play overlay`);
    }
  } else if (!thumb[0].includes(path.basename(talk.image))) {
    errors.push(
      `"${talk.title}": thumbnail is not ${path.basename(talk.image)}`,
    );
  }
}

if (errors.length) {
  console.error('❌ Talks page does not match _data/speaking.yml:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`✅ Talks page matches speaking.yml (${talks.length} talks)`);
