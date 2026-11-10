const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createWindow, loadModule } = require('./helpers');

function setup(html) {
  const window = createWindow(html);
  loadModule(window, 'lazy-loading.js');
  return window.document;
}

const loading = (el) => el.getAttribute('loading');

describe('lazy-loading', () => {
  test('keeps the first post-content image eager (LCP candidate)', () => {
    const doc = setup(
      '<img id="logo" src="/l.png">' +
        '<div id="main-content"><div class="post-content">' +
        '<img id="first" src="/1.png"><img id="second" src="/2.png">' +
        '</div></div>',
    );
    assert.equal(loading(doc.getElementById('first')), null);
    assert.equal(loading(doc.getElementById('second')), 'lazy');
    assert.equal(loading(doc.getElementById('logo')), 'lazy');
  });

  test('does not override an existing loading attribute', () => {
    const doc = setup(
      '<div id="main-content"><div class="post-content">' +
        '<img id="first" src="/1.png">' +
        '<img id="eager" loading="eager" src="/2.png"></div></div>',
    );
    assert.equal(loading(doc.getElementById('eager')), 'eager');
  });

  test('lazy-loads every image on pages without post content', () => {
    const doc = setup('<img id="a" src="/a.png"><img id="b" src="/b.png">');
    assert.equal(loading(doc.getElementById('a')), 'lazy');
    assert.equal(loading(doc.getElementById('b')), 'lazy');
  });

  test('picks the first image even when nested in a picture', () => {
    const doc = setup(
      '<div id="main-content"><div class="post-content">' +
        '<picture><img id="first" src="/1.png"></picture>' +
        '<img id="second" src="/2.png"></div></div>',
    );
    assert.equal(loading(doc.getElementById('first')), null);
    assert.equal(loading(doc.getElementById('second')), 'lazy');
  });
});
