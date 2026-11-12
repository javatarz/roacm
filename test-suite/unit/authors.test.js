// Builds a throwaway Jekyll site that reuses the real author includes and
// _data/authors.yml with fixture posts, so co-author rendering is checked
// without publishing a real post. Needs Ruby + bundler (CI has both).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..');
let tmp;
let outDir;

const LAYOUT = `{%- include resolve_authors.html source=page -%}
<script type="application/ld+json">{"author": {% include author_jsonld.html %}}</script>
<div class="post-meta">{% include post_byline.html %}<span class="post-date">d</span></div>
{{ content }}
{% include author_bio.html %}
`;

const post = (frontMatter) => `---\nlayout: post\n${frontMatter}\n---\nBody\n`;

function read(rel) {
  return fs.readFileSync(path.join(outDir, rel), 'utf8');
}

function jsonLd(html) {
  const m = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  return JSON.parse(m[1]);
}

before(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'authors-test-'));
  outDir = path.join(tmp, '_site');
  fs.mkdirSync(path.join(tmp, '_layouts'));
  fs.mkdirSync(path.join(tmp, '_posts'));
  fs.symlinkSync(path.join(ROOT, '_includes'), path.join(tmp, '_includes'));
  fs.mkdirSync(path.join(tmp, '_data'));
  fs.copyFileSync(
    path.join(ROOT, '_data', 'authors.yml'),
    path.join(tmp, '_data', 'authors.yml'),
  );
  // Fixture co-author with no url, avatar or bio, so assertions don't depend
  // on real author details.
  fs.appendFileSync(
    path.join(tmp, '_data', 'authors.yml'),
    '\nfixture-coauthor:\n  name: Fixture Coauthor\n',
  );
  fs.writeFileSync(path.join(tmp, '_layouts', 'post.html'), LAYOUT);
  fs.writeFileSync(
    path.join(tmp, '_config.yml'),
    [
      'url: https://example.test',
      'author: Karun Japhet',
      'social:',
      '  name: Karun Japhet',
      '  links:',
      '    - https://example.test/me',
      'title: Test',
      'plugins: []',
      'exclude: [Gemfile, Gemfile.lock]',
    ].join('\n'),
  );
  const posts = {
    legacy: 'author: Karun Japhet',
    multi: 'authors: [karun, fixture-coauthor]',
    three: 'authors: [karun, fixture-coauthor, ghost]',
    solo: 'authors: [karun]',
  };
  for (const [slug, fm] of Object.entries(posts)) {
    fs.writeFileSync(
      path.join(tmp, '_posts', `2026-01-01-${slug}.md`),
      post(fm),
    );
  }
  fs.symlinkSync(path.join(ROOT, '_plugins'), path.join(tmp, '_plugins'));
  fs.copyFileSync(path.join(ROOT, 'atom.xml'), path.join(tmp, 'atom.xml'));
  const res = spawnSync(
    'bundle',
    ['exec', 'jekyll', 'build', '--source', tmp, '--destination', outDir],
    { cwd: ROOT, encoding: 'utf8' },
  );
  assert.equal(res.status, 0, res.stdout + res.stderr);
  assert.doesNotMatch(
    res.stdout + res.stderr,
    /Liquid (Warning|Exception|error)/,
  );
});

after(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

const page = (slug) => read(`2026/01/01/${slug}.html`);

test('legacy author string renders the single-author bio and JSON-LD unchanged', () => {
  const html = page('legacy');
  assert.doesNotMatch(html, /post-authors/);
  assert.doesNotMatch(html, /author-bios/);
  assert.match(
    html,
    /<aside class="author-bio" aria-label="About the author">/,
  );
  assert.match(html, /src="https:\/\/github.com\/javatarz.png"/);
  assert.match(html, /<h2 class="author-name">Karun Japhet<\/h2>/);
  assert.match(html, /Now I write about AI-assisted engineering/);
  assert.deepEqual(jsonLd(html).author, {
    '@type': 'Person',
    name: 'Karun Japhet',
    url: 'https://karun.me',
    sameAs: ['https://example.test/me'],
  });
});

test('authors: [karun] matches the legacy output', () => {
  const strip = (h) => h.replace(/\s+/g, '');
  assert.equal(strip(page('solo')), strip(page('legacy')));
});

test('co-authored post shows a linked byline listing every author', () => {
  const html = page('multi');
  assert.match(html, /class="post-authors"/);
  assert.match(
    html,
    /By\s*<a href="https:\/\/karun.me"[^>]*>Karun Japhet<\/a> and Fixture Coauthor<\/span>/,
  );
});

test('three authors join with commas and a final "and"', () => {
  assert.match(
    page('three'),
    /<a href="https:\/\/karun.me"[^>]*>Karun Japhet<\/a>, Fixture Coauthor and ghost<\/span>/,
  );
});

test('co-authored JSON-LD emits an author array', () => {
  const { author } = jsonLd(page('multi'));
  assert.ok(Array.isArray(author));
  assert.deepEqual(
    author.map((a) => a.name),
    ['Karun Japhet', 'Fixture Coauthor'],
  );
  assert.equal(author[0].url, 'https://karun.me');
  assert.deepEqual(author[0].sameAs, ['https://example.test/me']);
  assert.equal(author[1].url, undefined);
  assert.equal(author[1]['@type'], 'Person');
});

test('co-authored bios are grouped, and authors without a bio get no card', () => {
  const html = page('multi');
  assert.match(
    html,
    /<div class="author-bios" role="group" aria-label="About the authors">/,
  );
  assert.equal((html.match(/class="author-bio"/g) || []).length, 1);
  assert.match(html, /aria-label="About Karun Japhet"/);
});

test('atom feed adds entry authors for co-authored posts only', () => {
  const feed = read('atom.xml');
  const entry = (slug) =>
    feed.split('<entry>').find((e) => e.includes(`/${slug}.html"`)) || '';
  const names = (e) =>
    [...e.matchAll(/<author>\s*<name><!\[CDATA\[(.*?)\]\]>/g)].map((m) => m[1]);
  assert.deepEqual(names(entry('multi')), ['Karun Japhet', 'Fixture Coauthor']);
  assert.match(entry('multi'), /<uri>https:\/\/karun.me<\/uri>/);
  assert.deepEqual(names(entry('legacy')), []);
});
