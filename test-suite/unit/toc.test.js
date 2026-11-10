const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createWindow, loadModule, fireDomContentLoaded } = require('./helpers');

const ARTICLE = `
<div id="toc"></div>
<main>
  <h2 id="intro">Intro</h2>
  <h3>Sub Section!</h3>
  <h2>Credits</h2>
  <h2>Comments</h2>
  <aside><h2>Sidebar</h2></aside>
  <div class="post-metadata"><h2>Meta</h2></div>
  <div class="post-navigation"><h3>Nav</h3></div>
  <h2 id="end">The End</h2>
</main>`;

function setup(html = ARTICLE, { tops = {}, reducedMotion = false } = {}) {
  const window = createWindow(html, {
    beforeLoad(w) {
      // jsdom has no layout: derive offsetTop from a per-heading map.
      Object.defineProperty(w.HTMLElement.prototype, 'offsetTop', {
        get() {
          return tops[this.id] || 0;
        },
      });
      w.matchMedia = () => ({ matches: reducedMotion });
      w.scrollTo = (opts) => {
        w.__scrolled = opts;
      };
    },
  });
  loadModule(window, 'toc.js');
  fireDomContentLoaded(window);
  return window;
}

const links = (w) => Array.from(w.document.querySelectorAll('.toc-link'));

describe('toc', () => {
  test('lists h2/h3 headings and excludes sidebar, metadata, credits', () => {
    const w = setup();
    assert.deepEqual(
      links(w).map((a) => a.textContent),
      ['Intro', 'Sub Section!', 'The End'],
    );
  });

  test('assigns classes by heading level', () => {
    const w = setup();
    const items = Array.from(w.document.querySelectorAll('.toc-list li'));
    assert.deepEqual(
      items.map((li) => li.className),
      ['toc-h2', 'toc-h3', 'toc-h2'],
    );
  });

  test('generates slug ids for headings lacking one, keeps existing ids', () => {
    const w = setup();
    const sub = Array.from(w.document.querySelectorAll('h3')).find(
      (h) => h.textContent === 'Sub Section!',
    );
    assert.equal(sub.id, 'heading-sub-section');
    assert.equal(w.document.querySelector('h2').id, 'intro');
    assert.equal(links(w)[1].getAttribute('href'), '#heading-sub-section');
  });

  test('hides the ToC when there are fewer than 3 headings', () => {
    const w = setup('<div id="toc"></div><main><h2>A</h2><h2>B</h2></main>');
    assert.equal(w.document.getElementById('toc').style.display, 'none');
    assert.equal(links(w).length, 0);
  });

  test('does nothing without a #toc container', () => {
    const w = setup('<main><h2>A</h2><h2>B</h2><h2>C</h2></main>');
    assert.equal(w.document.querySelector('.toc-nav'), null);
  });

  test('nav has an accessible label', () => {
    const w = setup();
    assert.equal(
      w.document.querySelector('nav.toc-nav').getAttribute('aria-label'),
      'Table of contents',
    );
  });

  describe('scroll-spy', () => {
    const tops = { intro: 0, 'heading-sub-section': 500, end: 1000 };
    const active = (w) =>
      links(w)
        .filter((a) => a.classList.contains('active'))
        .map((a) => a.textContent);

    test('highlights the last heading above scrollTop + 100', () => {
      const w = setup(ARTICLE, { tops });
      assert.deepEqual(active(w), ['Intro']);

      w.pageYOffset = 450; // 450 + 100 >= 500
      w.dispatchEvent(new w.Event('scroll'));
      assert.deepEqual(active(w), ['Sub Section!']);

      w.pageYOffset = 2000;
      w.dispatchEvent(new w.Event('scroll'));
      assert.deepEqual(active(w), ['The End']);
    });

    test('does not switch before the 100px lookahead', () => {
      const w = setup(ARTICLE, { tops });
      w.pageYOffset = 399; // 499 < 500
      w.dispatchEvent(new w.Event('scroll'));
      assert.deepEqual(active(w), ['Intro']);
    });

    test('has no active link above the first heading', () => {
      const w = setup(ARTICLE, {
        tops: { intro: 300, 'heading-sub-section': 500, end: 1000 },
      });
      assert.deepEqual(active(w), []);
    });
  });

  describe('click navigation', () => {
    function click(w, a) {
      const e = new w.MouseEvent('click', { bubbles: true, cancelable: true });
      a.dispatchEvent(e);
      return e;
    }

    test('scrolls smoothly to the heading minus 20px and focuses it', () => {
      const w = setup(ARTICLE, { tops: { end: 1000 } });
      const e = click(w, links(w)[2]);
      assert.equal(e.defaultPrevented, true);
      assert.equal(w.__scrolled.top, 980);
      assert.equal(w.__scrolled.behavior, 'smooth');
      assert.equal(w.location.hash, '#end');
      assert.equal(w.document.activeElement.id, 'end');
      assert.equal(w.document.getElementById('end').tabIndex, -1);
    });

    test('uses instant scroll when reduced motion is preferred', () => {
      const w = setup(ARTICLE, { tops: { end: 1000 }, reducedMotion: true });
      click(w, links(w)[2]);
      assert.equal(w.__scrolled.behavior, 'auto');
    });

    test('tracks navigation through UmamiTracker when present', () => {
      const w = setup();
      const calls = [];
      w.UmamiTracker = { track: (name, data) => calls.push([name, data]) };
      click(w, links(w)[0]);
      // JSON compare: jsdom objects live in another realm.
      assert.equal(
        JSON.stringify(calls),
        '[["toc-navigate",{"heading":"Intro"}]]',
      );
    });
  });
});
