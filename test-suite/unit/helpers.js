// Shared jsdom harness for assets/js unit tests. Loads a module's source into
// a fresh window exactly as the browser (and the Terser bundle) would, so the
// production files need no export shims.
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const JS_DIR = path.join(__dirname, '..', '..', 'assets', 'js');

function createWindow(html, { beforeLoad } = {}) {
  const dom = new JSDOM(`<!doctype html><html><body>${html}</body></html>`, {
    url: 'https://example.test/post/',
    runScripts: 'outside-only',
  });
  const { window } = dom;
  // Run rAF callbacks synchronously so scroll handlers are observable.
  window.requestAnimationFrame = (cb) => {
    cb(0);
    return 0;
  };
  if (beforeLoad) {
    beforeLoad(window);
  }
  return window;
}

function loadModule(window, file) {
  const source = fs.readFileSync(path.join(JS_DIR, file), 'utf8');
  window.eval(source);
}

function fireDomContentLoaded(window) {
  window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
}

module.exports = { createWindow, loadModule, fireDomContentLoaded };
