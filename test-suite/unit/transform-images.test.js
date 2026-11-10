// scripts/transform-images.mjs runs main() on import and has no exports, so this
// exercises it the way CI does: as a subprocess against a throwaway _site.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const sharp = require('sharp');

const SCRIPT = path.join(
  __dirname,
  '..',
  '..',
  'scripts',
  'transform-images.mjs',
);
let tmp;

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'transform-images-'));
  const imgDir = path.join(tmp, '_site', 'assets', 'images');
  fs.mkdirSync(imgDir, { recursive: true });

  // Noise defeats compression so every fixture clears the 50KB threshold.
  const raw = Buffer.alloc(300 * 300 * 3);
  for (let i = 0; i < raw.length; i++) {
    raw[i] = (i * 2654435761) >>> 24;
  }
  const png = await sharp(raw, {
    raw: { width: 300, height: 300, channels: 3 },
  })
    .png({ compressionLevel: 0 })
    .toBuffer();
  assert.ok(png.length > 50 * 1024, 'fixture must exceed the size threshold');
  // sharp sniffs content, not extension, so PNG bytes behave as a readable .gif.
  for (const name of ['big.png', 'anim.gif', 'ANIM2.GIF']) {
    fs.writeFileSync(path.join(imgDir, name), png);
  }

  // Wider than the largest srcset variant (1280px), still over the size threshold.
  const wideRaw = Buffer.alloc(1500 * 20 * 3);
  for (let i = 0; i < wideRaw.length; i++) {
    wideRaw[i] = (i * 2654435761) >>> 24;
  }
  const widePng = await sharp(wideRaw, {
    raw: { width: 1500, height: 20, channels: 3 },
  })
    .png({ compressionLevel: 0 })
    .toBuffer();
  assert.ok(
    widePng.length > 50 * 1024,
    'wide fixture must clear the threshold',
  );
  fs.writeFileSync(path.join(imgDir, 'wide.png'), widePng);
  fs.writeFileSync(
    path.join(tmp, '_site', 'wide.html'),
    '<html><head>' +
      '<meta property="og:image" content="/assets/images/wide.png" />' +
      '<meta name="twitter:image" content="/assets/images/wide.png" />' +
      '</head><body><img src="/assets/images/wide.png" alt="wide"></body></html>',
  );
  fs.writeFileSync(
    path.join(tmp, '_site', 'index.html'),
    '<html><body>' +
      '<img src="/assets/images/big.png" alt="png">' +
      '<img src="/assets/images/anim.gif" alt="gif">' +
      '<img src="/assets/images/ANIM2.GIF" alt="gif upper">' +
      '</body></html>',
  );
  const result = spawnSync('node', [SCRIPT], { cwd: tmp, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

after(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe('transform-images', () => {
  const html = () =>
    fs.readFileSync(path.join(tmp, '_site', 'index.html'), 'utf8');

  test('wraps large PNGs in <picture> with a WebP source (control)', () => {
    assert.match(html(), /<picture>[\s\S]*big\.webp[\s\S]*alt="png"/);
  });

  // 68f9e2d: optimize-images.mjs never generates WebP variants for GIFs, so a
  // <picture> reference would point at a file that does not exist.
  test('leaves GIFs untouched, any case (68f9e2d)', () => {
    const out = html();
    assert.ok(out.includes('<img src="/assets/images/anim.gif" alt="gif">'));
    assert.ok(
      out.includes('<img src="/assets/images/ANIM2.GIF" alt="gif upper">'),
    );
    assert.doesNotMatch(out, /anim[^"]*\.webp/i);
  });

  // #300: a 2x/3x display must not pick the full-resolution original.
  test('omits an original wider than 1280px from srcset (#300)', () => {
    const out = fs.readFileSync(path.join(tmp, '_site', 'wide.html'), 'utf8');
    assert.match(out, /wide-1280w\.webp 1280w/);
    assert.doesNotMatch(out, /wide\.webp 1500w/);
  });

  test('keeps the original in srcset when it is within 1280px (#300)', () => {
    assert.match(html(), /big\.webp 300w/);
  });

  test('points og:image and twitter:image at the 1280w variant (#300)', () => {
    const out = fs.readFileSync(path.join(tmp, '_site', 'wide.html'), 'utf8');
    assert.match(out, /og:image" content="\/assets\/images\/wide-1280w\.png"/);
    assert.match(
      out,
      /twitter:image" content="\/assets\/images\/wide-1280w\.png"/,
    );
  });
});
