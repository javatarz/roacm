const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createWindow, loadModule } = require('./helpers');

// jsdom does no layout or image decoding, so stub the geometry the module reads.
function stubImage(img, { naturalWidth, clientWidth, complete = true }) {
  Object.defineProperty(img, 'naturalWidth', { value: naturalWidth });
  Object.defineProperty(img, 'clientWidth', { value: clientWidth });
  Object.defineProperty(img, 'complete', { value: complete });
}

function setup(html, geometry = { naturalWidth: 2000, clientWidth: 800 }) {
  const window = createWindow(
    `<div id="main-content"><div class="post-content">${html}</div></div>`,
  );
  window.document
    .querySelectorAll('img')
    .forEach((img) => stubImage(img, geometry));
  loadModule(window, 'image-zoom-links.js');
  return window;
}

describe('image-zoom-links', () => {
  test('wraps a large bare img in a link to its original', () => {
    const { document } = setup('<img src="/assets/images/a.png">');
    const img = document.querySelector('img');
    assert.equal(img.parentElement.tagName, 'A');
    assert.equal(
      img.parentElement.getAttribute('href'),
      '/assets/images/a.png',
    );
    assert.equal(img.parentElement.target, '_blank');
    assert.equal(img.parentElement.rel, 'noopener');
  });

  // c80978e: inline anchors reintroduce the gap-under-image whitespace bug.
  test('wrapper link is display:block (c80978e whitespace gap)', () => {
    const { document } = setup('<img src="/assets/images/a.png">');
    assert.equal(document.querySelector('a').style.display, 'block');
  });

  // a7b1dbc: img.src is absolute, which triggers the external-link arrow CSS
  // (.post-content a[href^=http]::after).
  test('href is the raw src attribute, never absolute (a7b1dbc)', () => {
    const { document } = setup('<img src="/assets/images/a.png">');
    const href = document.querySelector('a').getAttribute('href');
    assert.equal(href, '/assets/images/a.png');
    assert.ok(!/^https?:/.test(href), 'href must not start with http(s)');
  });

  // 41c0a17: <img> must stay a direct child of <picture> or the browser
  // refetches the full-size fallback.
  test('wraps the <picture>, keeping <img> a direct child (41c0a17)', () => {
    const { document } = setup(
      '<picture><source type="image/webp" srcset="/assets/images/a.webp">' +
        '<img src="/assets/images/a.png"></picture>',
    );
    const img = document.querySelector('img');
    const picture = document.querySelector('picture');
    assert.equal(img.parentElement, picture);
    assert.equal(picture.parentElement.tagName, 'A');
    assert.equal(
      picture.parentElement.getAttribute('href'),
      '/assets/images/a.png',
    );
    assert.equal(document.querySelectorAll('a').length, 1);
  });

  test('leaves images already inside a link alone', () => {
    const { document } = setup(
      '<a href="https://other.test/"><img src="/assets/images/a.png"></a>',
    );
    assert.equal(document.querySelectorAll('a').length, 1);
    assert.equal(
      document.querySelector('a').getAttribute('href'),
      'https://other.test/',
    );
  });

  test('skips raster images without enough headroom', () => {
    const { document } = setup('<img src="/assets/images/a.png">', {
      naturalWidth: 850,
      clientWidth: 800,
    });
    assert.equal(document.querySelectorAll('a').length, 0);
  });

  test('wraps raster images just above the 1.15 headroom ratio', () => {
    const { document } = setup('<img src="/assets/images/a.png">', {
      naturalWidth: 931,
      clientWidth: 800,
    });
    assert.equal(document.querySelectorAll('a').length, 1);
  });

  test('always wraps SVGs regardless of headroom', () => {
    const { document } = setup('<img src="/assets/images/a.SVG">', {
      naturalWidth: 100,
      clientWidth: 800,
    });
    assert.equal(document.querySelectorAll('a').length, 1);
  });

  test('ignores images outside post content', () => {
    const window = createWindow('<img id="x" src="/assets/images/a.png">');
    stubImage(window.document.getElementById('x'), {
      naturalWidth: 2000,
      clientWidth: 800,
    });
    loadModule(window, 'image-zoom-links.js');
    assert.equal(window.document.querySelectorAll('a').length, 0);
  });

  test('defers wrapping until an incomplete image loads', () => {
    const window = createWindow(
      '<div id="main-content"><div class="post-content">' +
        '<img src="/assets/images/a.png"></div></div>',
    );
    const img = window.document.querySelector('img');
    stubImage(img, { naturalWidth: 2000, clientWidth: 800, complete: false });
    loadModule(window, 'image-zoom-links.js');
    assert.equal(window.document.querySelectorAll('a').length, 0);
    img.dispatchEvent(new window.Event('load'));
    assert.equal(window.document.querySelectorAll('a').length, 1);
  });
});
