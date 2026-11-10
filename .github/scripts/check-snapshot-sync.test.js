const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  checkSync,
  completionPlan,
  parsePorcelain,
} = require('./check-snapshot-sync.js');

const dir = 'test-suite/tests/a.spec.ts-snapshots';
const snap = (name, b) => `${dir}/${name}-${b}-linux.png`;
const all = (name) =>
  ['chromium', 'firefox', 'webkit'].map((b) => snap(name, b));

test('all three browsers changed passes', () => {
  const r = checkSync([...all('home'), ...all('about'), 'README.md']);
  assert.equal(r.skipped, false);
  assert.deepEqual(r.problems, []);
});

test('chromium only is flagged', () => {
  const r = checkSync([snap('home', 'chromium')]);
  assert.equal(r.problems.length, 1);
  assert.deepEqual(r.problems[0].missing, ['firefox', 'webkit']);
});

test('firefox/webkit without chromium is flagged (reverse)', () => {
  const r = checkSync([snap('home', 'firefox'), snap('home', 'webkit')]);
  assert.deepEqual(r.problems[0].missing, ['chromium']);
});

test('names are matched per screenshot', () => {
  const r = checkSync([...all('home'), snap('about', 'chromium')]);
  assert.deepEqual(
    r.problems.map((p) => p.key),
    [`${dir}/about`],
  );
});

test('no snapshot files is skipped', () => {
  assert.equal(checkSync(['_posts/x.md', 'assets/css/a.css']).skipped, true);
  assert.equal(checkSync([]).skipped, true);
});

// End to end against a throwaway repo (new-branch path: remote sha is zeros)
const script = path.resolve(__dirname, 'check-snapshot-sync.js');
function run(setup) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'snapsync-'));
  const g = (...a) =>
    execFileSync('git', a, { cwd: repo, encoding: 'utf8' }).trim();
  g('init', '-q', '-b', 'main');
  g('config', 'user.email', 't@t');
  g('config', 'user.name', 't');
  g('config', 'commit.gpgsign', 'false');
  fs.writeFileSync(path.join(repo, 'f'), '1');
  g('add', '.');
  g('commit', '-qm', 'base');
  g('update-ref', 'refs/remotes/origin/main', 'HEAD');
  g('checkout', '-qb', 'feat');
  let n = 0;
  setup((files) => {
    for (const f of files) {
      fs.mkdirSync(path.dirname(path.join(repo, f)), { recursive: true });
      fs.writeFileSync(path.join(repo, f), String(n++));
    }
    g('add', '.');
    g('commit', '-qm', 'c');
  });
  const head = g('rev-parse', 'HEAD');
  const res = spawnSync('node', [script, head, '0'.repeat(40)], {
    cwd: repo,
    encoding: 'utf8',
  });
  fs.rmSync(repo, { recursive: true, force: true });
  return res;
}

test('CLI: new branch with all three passes', () => {
  assert.equal(run((c) => c(all('home'))).status, 0);
});

test('CLI: new branch with chromium only blocks', () => {
  const r = run((c) => c([snap('home', 'chromium')]));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /just snapshots/);
});

test('CLI: counterparts in a later commit of the same range pass', () => {
  const r = run((c) => {
    c([snap('home', 'chromium')]);
    c([snap('home', 'firefox'), snap('home', 'webkit')]);
  });
  assert.equal(r.status, 0);
});

test('CLI: no snapshots skips', () => {
  const r = run((c) => c(['docs/x.md']));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /skipping/);
});

test('completionPlan deletes unchanged counterparts of a chromium-only change', () => {
  const existing = new Set([...all('home'), ...all('about')]);
  const plan = completionPlan([snap('home', 'chromium')], existing);
  assert.deepEqual(plan.remove, [
    snap('home', 'firefox'),
    snap('home', 'webkit'),
  ]);
  assert.deepEqual(plan.browsers, ['firefox', 'webkit']);
});

test('completionPlan is empty for complete sets and ignores missing files', () => {
  const existing = new Set(all('home'));
  assert.deepEqual(completionPlan(all('home'), existing).remove, []);
  const plan = completionPlan([snap('new', 'chromium')], existing);
  assert.deepEqual(plan, { remove: [], browsers: [] });
});

test('parsePorcelain extracts paths and tracked set', () => {
  const out = ` M ${snap('home', 'chromium')}\n?? ${snap('x', 'webkit')}\n`;
  const r = parsePorcelain(out, [snap('home', 'firefox')]);
  assert.deepEqual(r.changed, [snap('home', 'chromium'), snap('x', 'webkit')]);
  assert.ok(r.existing.has(snap('home', 'firefox')));
});
