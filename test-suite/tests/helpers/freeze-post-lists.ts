import { Page } from '@playwright/test';

/**
 * Freeze the dynamic post lists so visual baselines do not depend on which
 * posts exist.
 *
 * Adding a post changes the blog index, the homepage "Writing" row, the
 * archive, category and tag pages, and the related-posts fallback on post
 * pages. Without this, every new post means regenerating a few hundred
 * baselines across three browsers for no visual reason.
 *
 * Each list is cut down to a fixed number of items cloned from its first
 * item, with constant text, so layout (grid, spacing, theming, typography)
 * is still covered but titles, dates and counts no longer vary. How real
 * titles wrap is not a visual-layer concern.
 *
 * Call this before `stabilize` waits on images (stabilize does it for you).
 */
export async function freezePostLists(page: Page): Promise<void> {
  await page.evaluate(() => {
    const TITLE = 'Placeholder post title for visual baselines';
    const DATE_LONG = 'Jan 01, 2026';
    const READ_TIME = '5 min read';
    const EXCERPT =
      'Placeholder excerpt text that keeps this card the same height on every run, whatever the latest posts are.';

    // Replace an element's own text while keeping child elements (icons).
    const setText = (el: Element | null, text: string) => {
      if (!el) return;
      Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .forEach((n) => n.remove());
      el.append(document.createTextNode(` ${text} `));
    };

    // Cut every group of siblings matching `selector` to `count` items cloned
    // from the first one, then let `fill` write constant text into each.
    const freeze = (selector: string, count: number, fill: (el: HTMLElement, i: number) => void) => {
      const items = Array.from(document.querySelectorAll<HTMLElement>(selector));
      const byParent = new Map<Element, HTMLElement[]>();
      items.forEach((el) => {
        const parent = el.parentElement;
        if (!parent) return;
        byParent.set(parent, [...(byParent.get(parent) ?? []), el]);
      });
      byParent.forEach((group, parent) => {
        const template = group[0].cloneNode(true) as HTMLElement;
        const next = group[group.length - 1].nextSibling;
        group.forEach((el) => el.remove());
        for (let i = 0; i < count; i += 1) {
          const el = template.cloneNode(true) as HTMLElement;
          fill(el, i);
          parent.insertBefore(el, next);
        }
      });
    };

    // Links inside placeholders must not navigate anywhere real.
    const neutralise = (el: HTMLElement) => {
      el.querySelectorAll('a').forEach((a) => a.setAttribute('href', '#'));
      if (el.tagName === 'A') el.setAttribute('href', '#');
    };

    // Blog index and category pages: .post-card grids.
    freeze('.post-card', 6, (el) => {
      setText(el.querySelector('.post-card-title'), TITLE);
      setText(el.querySelector('.post-card-meta time'), DATE_LONG);
      setText(el.querySelector('.post-card-reading-time'), READ_TIME);
      setText(el.querySelector('.post-card-excerpt'), EXCERPT);
      neutralise(el);
    });

    // Homepage: only the Writing row is post driven (speaking and projects
    // come from data files).
    freeze('[aria-labelledby="writing-heading"] .homepage-card', 3, (el) => {
      setText(el.querySelector('.homepage-card-title'), TITLE);
      setText(el.querySelector('.homepage-card-meta time'), DATE_LONG);
      setText(el.querySelector('.homepage-card-reading-time'), READ_TIME);
      neutralise(el);
    });

    // Post pages: related posts fall back to the newest posts.
    freeze('.related-post-card', 3, (el) => {
      setText(el.querySelector('.related-post-title'), TITLE);
      setText(el.querySelector('.related-post-meta time'), DATE_LONG);
      setText(el.querySelector('.related-post-reading-time'), '5 min');
      neutralise(el);
    });

    // Tag pages: <article> entries inside .blog-index.archive-list.
    freeze('.blog-index.archive-list > article', 3, (el) => {
      setText(el.querySelector('.entry-title a'), TITLE);
      setText(el.querySelector('.post-date'), DATE_LONG);
      setText(el.querySelector('.reading-time'), READ_TIME);
      const content = el.querySelector('.entry-content');
      const readMore = content?.querySelector('p');
      if (content && readMore) {
        Array.from(content.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .forEach((n) => n.remove());
        content.prepend(document.createTextNode(EXCERPT));
      }
      neutralise(el);
    });

    // Archive: flat <h2.archive-year> + <ul.archive-list> pairs. Keep two
    // year groups of four items so new years and new posts never shift it.
    const archive = document.querySelector('.archive-page');
    if (archive) {
      const headings = Array.from(archive.querySelectorAll<HTMLElement>(':scope > h2.archive-year'));
      const lists = Array.from(archive.querySelectorAll<HTMLElement>(':scope > ul.archive-list'));
      headings.forEach((h, i) => {
        if (i >= 2) {
          h.remove();
          lists[i]?.remove();
          return;
        }
        setText(h.querySelector('.archive-year-label'), String(2026 - i));
        setText(h.querySelector('.archive-year-count'), '4 posts');
        const list = lists[i];
        if (!list) return;
        const items = Array.from(list.querySelectorAll<HTMLElement>(':scope > .archive-item'));
        const template = items[0].cloneNode(true) as HTMLElement;
        items.forEach((li) => li.remove());
        for (let n = 0; n < 4; n += 1) {
          const li = template.cloneNode(true) as HTMLElement;
          setText(li.querySelector('.archive-date'), 'Jan 01');
          setText(li.querySelector('.archive-link'), TITLE);
          neutralise(li);
          list.append(li);
        }
      });
    }
  });
}
