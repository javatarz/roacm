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

function formatProblems(problems) {
  const lines = problems.map(
    (p) =>
      `  ${p.key}-*-linux.png: changed for ${p.have.join(', ')}; missing ${p.missing.join(', ')}`,
  );
  return [
    'Visual baselines changed for some browsers but not all three:',
    ...lines,
    'Run "npm run snapshots" to regenerate chromium/firefox/webkit together,',
    'commit the changed *-linux.png files, then push again.',
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

function main(argv) {
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

module.exports = { checkSync, formatProblems, changedFiles, main };

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}
