const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createWindow, loadModule, fireDomContentLoaded } = require('./helpers');

function setup({ scrollHeight, innerHeight, scrollY = 0, withBar = true }) {
  const window = createWindow(
    withBar ? '<div class="reading-progress-bar"></div>' : '',
    {
      beforeLoad(w) {
        Object.defineProperty(w.document.documentElement, 'scrollHeight', {
          get: () => scrollHeight,
        });
        w.innerHeight = innerHeight;
        w.pageYOffset = scrollY;
      },
    },
  );
  loadModule(window, 'reading-progress.js');
  fireDomContentLoaded(window);
  return window;
}

const width = (w) =>
  w.document.querySelector('.reading-progress-bar').style.width;
const scrollTo = (w, y) => {
  w.pageYOffset = y;
  w.dispatchEvent(new w.Event('scroll'));
};

describe('reading-progress', () => {
  test('starts at 0% at the top of a long page', () => {
    assert.equal(width(setup({ scrollHeight: 3000, innerHeight: 1000 })), '0%');
  });

  test('computes percentage of scrollable distance', () => {
    const w = setup({ scrollHeight: 3000, innerHeight: 1000 });
    scrollTo(w, 500); // scrollable = 2000
    assert.equal(width(w), '25%');
    scrollTo(w, 2000);
    assert.equal(width(w), '100%');
  });

  test('shows 100% when the page is not taller than the viewport', () => {
    // Guards against divide-by-zero / NaN / Infinity.
    assert.equal(width(setup({ scrollHeight: 800, innerHeight: 800 })), '100%');
    assert.equal(width(setup({ scrollHeight: 500, innerHeight: 800 })), '100%');
  });

  test('is a no-op without a progress bar element', () => {
    assert.doesNotThrow(() =>
      setup({ scrollHeight: 3000, innerHeight: 1000, withBar: false }),
    );
  });
});
