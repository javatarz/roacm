#!/usr/bin/env node
// Guard: visual baselines must be regenerated for all three browsers together.
// If a push range changes a *-<browser>-linux.png without the same screenshot
// for the other two browsers, fail with an actionable message (issue #306).
//
// CLI: node scripts/check-snapshot-sync.js <local_sha> <remote_sha>
//   (the SHAs husky passes on stdin; remote_sha all zeros = new branch)
const { execFileSync } = require('node:child_process');

const BROWSERS = ['chromium', 'firefox', 'webkit'];
const ZERO = /^0+$/;
const SNAP_RE = new RegExp(`^(.*)-(${BROWSERS.join('|')})-linux\\.png$`);

// Pure logic: files -> { skipped, problems: [{key, have, missing}] }
function checkSync(files) {
  const groups = new Map();
  for (const f of files) {
    const m = SNAP_RE.exec(f);
    if (!m) {
      continue;
    }
    if (!groups.has(m[1])) {
      groups.set(m[1], new Set());
    }
    groups.get(m[1]).add(m[2]);
  }
  const problems = [];
  for (const [key, have] of [...groups].sort()) {
    const missing = BROWSERS.filter((b) => !have.has(b));
    if (missing.length) {
      problems.push({
        key,
        have: BROWSERS.filter((b) => have.has(b)),
        missing,
      });
    }
  }
  return { skipped: groups.size === 0, problems };
}

// Pure logic: files changed in the working tree -> the unchanged counterpart
// baselines to delete so a rerun of --update-snapshots rewrites them (#379).
// Playwright only rewrites a baseline that differs beyond maxDiffPixelRatio, so
// a real change can touch chromium alone. `existing` is a Set of tracked paths.
function completionPlan(changed, existing) {
  const plan = { remove: [], browsers: [] };
  const { problems } = checkSync(changed);
  for (const p of problems) {
    for (const b of p.missing) {
      const f = `${p.key}-${b}-linux.png`;
      if (existing.has(f)) {
        plan.remove.push(f);
        if (!plan.browsers.includes(b)) {
          plan.browsers.push(b);
        }
      }
    }
  }
  return plan;
}

// Parse `git status --porcelain` into { changed, existing } for completionPlan.
// Deleted entries count as changed but not existing.
function parsePorcelain(out, tracked) {
  const changed = [];
  for (const line of out.split('\n')) {
    if (line.length > 3) {
      changed.push(line.slice(3).replace(/^.* -> /, ''));
    }
  }
  return { changed, existing: new Set(tracked) };
}

function formatProblems(problems) {
  const lines = problems.map(
    (p) =>
      `  ${p.key}-*-linux.png: changed for ${p.have.join(', ')}; missing ${p.missing.join(', ')}`,
  );
  return [
    'Visual baselines changed for some browsers but not all three:',
    ...lines,
    'Run "just snapshots" (it completes partial sets automatically), commit the',
    'changed *-linux.png files, then push again. Hand-edited partial sets stay blocked.',
  ].join('\n');
}

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function tryGit(args) {
  try {
    return git(args).trim();
  } catch {
    return null;
  }
}

// Files changed by the push: remote_sha..local_sha, or for a new branch (or a
// remote_sha we do not have locally) everything since the merge-base with origin/main.
function changedFiles(localSha, remoteSha) {
  let base;
  if (
    !ZERO.test(remoteSha) &&
    tryGit(['cat-file', '-e', `${remoteSha}^{commit}`]) !== null
  ) {
    base = remoteSha;
  } else {
    base = tryGit(['merge-base', 'origin/main', localSha]);
  }
  if (!base) {
    return null;
  }
  return git(['diff', '--name-only', base, localSha])
    .split('\n')
    .filter(Boolean);
}

// CLI helper for scripts/visual-snapshots.sh: print baselines to delete and
// the browsers to rerun ("remove <file>" / "browser <name>" lines).
function planMain() {
  const status = git(['status', '--porcelain', '--', '*-linux.png']);
  const tracked = git(['ls-files', '--', '*-linux.png']).split('\n');
  const { changed, existing } = parsePorcelain(status, tracked);
  const plan = completionPlan(changed, existing);
  for (const f of plan.remove) {
    console.log(`remove ${f}`);
  }
  for (const b of plan.browsers) {
    console.log(`browser ${b}`);
  }
  return 0;
}

function main(argv) {
  if (argv[0] === '--complete-plan') {
    return planMain();
  }
  const [localSha, remoteSha = '0'] = argv;
  if (!localSha) {
    console.error('usage: check-snapshot-sync.js <local_sha> <remote_sha>');
    return 2;
  }
  if (ZERO.test(localSha)) {
    return 0;
  } // branch deletion
  const files = changedFiles(localSha, remoteSha);
  if (files === null) {
    console.log('Snapshot sync check: cannot determine push range, skipping');
    return 0;
  }
  const { skipped, problems } = checkSync(files);
  if (skipped) {
    console.log('Snapshot sync check: no snapshot files in range, skipping');
    return 0;
  }
  if (problems.length) {
    console.error(formatProblems(problems));
    return 1;
  }
  console.log('Snapshot sync check: chromium/firefox/webkit baselines in sync');
  return 0;
}

module.exports = {
  completionPlan,
  parsePorcelain,
  checkSync,
  formatProblems,
  changedFiles,
  main,
};

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}
