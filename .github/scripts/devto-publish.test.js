/* global require */
const { describe, it, mock } = require('node:test');
const assert = require('node:assert');
const {
  parsePostFilename,
  getPostDate,
  isFuturePost,
  getCanonicalUrl,
  convertMarkdown,
} = require('./devto-publish.js');

describe('parsePostFilename', () => {
  it('extracts date and slug from valid filename', () => {
    const result = parsePostFilename('_posts/2026-01-02-my-post-slug.markdown');
    assert.deepStrictEqual(result, {
      year: '2026',
      month: '01',
      day: '02',
      slug: 'my-post-slug',
    });
  });

  it('handles paths with directories', () => {
    const result = parsePostFilename(
      '/full/path/to/_posts/2024-12-25-christmas-post.markdown',
    );
    assert.deepStrictEqual(result, {
      year: '2024',
      month: '12',
      day: '25',
      slug: 'christmas-post',
    });
  });

  it('throws on invalid filename format', () => {
    assert.throws(
      () => parsePostFilename('invalid-filename.markdown'),
      /Invalid post filename format/,
    );
  });

  it('throws on missing date components', () => {
    assert.throws(
      () => parsePostFilename('2024-12-post.markdown'),
      /Invalid post filename format/,
    );
  });
});

describe('getPostDate', () => {
  it('returns UTC midnight for the post date', () => {
    const date = getPostDate('_posts/2026-01-02-test.markdown');
    assert.strictEqual(date.toISOString(), '2026-01-02T00:00:00.000Z');
  });

  it('handles different months correctly', () => {
    const date = getPostDate('_posts/2024-06-15-summer-post.markdown');
    assert.strictEqual(date.toISOString(), '2024-06-15T00:00:00.000Z');
  });

  it('returns start of day, not end', () => {
    const date = getPostDate('_posts/2026-01-02-test.markdown');
    assert.strictEqual(date.getUTCHours(), 0);
    assert.strictEqual(date.getUTCMinutes(), 0);
    assert.strictEqual(date.getUTCSeconds(), 0);
  });
});

describe('isFuturePost', () => {
  it('returns true for posts dated in the future', () => {
    // Use a date far in the future to avoid test flakiness
    const result = isFuturePost('_posts/2099-12-31-future-post.markdown');
    assert.strictEqual(result, true);
  });

  it('returns false for posts dated in the past', () => {
    const result = isFuturePost('_posts/2020-01-01-old-post.markdown');
    assert.strictEqual(result, false);
  });

  it('returns false for posts dated today (after midnight UTC)', () => {
    // Mock current time to 10:00 UTC on Jan 2, 2026
    const mockDate = new Date('2026-01-02T10:00:00Z');
    mock.timers.enable({ apis: ['Date'], now: mockDate.getTime() });

    try {
      // Post dated Jan 2, 2026 - should NOT be future (it's today)
      const result = isFuturePost('_posts/2026-01-02-today-post.markdown');
      assert.strictEqual(result, false);
    } finally {
      mock.timers.reset();
    }
  });

  it('returns true for tomorrow posts', () => {
    // Mock current time to 10:00 UTC on Jan 1, 2026
    const mockDate = new Date('2026-01-01T10:00:00Z');
    mock.timers.enable({ apis: ['Date'], now: mockDate.getTime() });

    try {
      // Post dated Jan 2, 2026 - should be future
      const result = isFuturePost('_posts/2026-01-02-tomorrow-post.markdown');
      assert.strictEqual(result, true);
    } finally {
      mock.timers.reset();
    }
  });

  it('edge case: returns false at exactly midnight UTC on post date', () => {
    // Mock current time to exactly midnight UTC on Jan 2, 2026
    const mockDate = new Date('2026-01-02T00:00:00.000Z');
    mock.timers.enable({ apis: ['Date'], now: mockDate.getTime() });

    try {
      // Post date equals current time - postDate > now is false
      const result = isFuturePost('_posts/2026-01-02-midnight-post.markdown');
      assert.strictEqual(result, false);
    } finally {
      mock.timers.reset();
    }
  });

  it('edge case: returns true 1ms before midnight UTC on post date', () => {
    // Mock current time to 1ms before midnight UTC on Jan 2, 2026
    const mockDate = new Date('2026-01-01T23:59:59.999Z');
    mock.timers.enable({ apis: ['Date'], now: mockDate.getTime() });

    try {
      const result = isFuturePost('_posts/2026-01-02-almost-midnight.markdown');
      assert.strictEqual(result, true);
    } finally {
      mock.timers.reset();
    }
  });
});

describe('getCanonicalUrl', () => {
  it('generates URL with correct path structure', () => {
    // SITE_URL is captured at module load, so we just verify the path format
    const url = getCanonicalUrl('_posts/2026-01-02-my-post.markdown');
    assert.ok(url.endsWith('/blog/2026/01/02/my-post/'));
  });
});

describe('convertMarkdown', () => {
  describe('post_url links', () => {
    it('converts post_url to dev.to URL when post exists in tracking', () => {
      const content =
        'Check out [my post]({% post_url 2025-07-07-patterns-for-ai %})';
      const tracking = {
        '_posts/2025-07-07-patterns-for-ai.markdown': {
          id: 123,
          url: 'https://dev.to/javatarz/patterns-for-ai-4ga2',
        },
      };
      const result = convertMarkdown(content, tracking);
      assert.ok(
        result.includes('https://dev.to/javatarz/patterns-for-ai-4ga2'),
      );
      assert.ok(!result.includes('/blog/2025/07/07/patterns-for-ai/'));
    });

    it('falls back to site URL when post not in tracking', () => {
      const content =
        'Check out [my post]({% post_url 2025-07-07-patterns-for-ai %})';
      const tracking = {};
      const result = convertMarkdown(content, tracking);
      assert.ok(result.includes('/blog/2025/07/07/patterns-for-ai/'));
    });

    it('falls back to site URL when no tracking provided', () => {
      const content =
        'Check out [my post]({% post_url 2025-07-07-patterns-for-ai %})';
      const result = convertMarkdown(content);
      assert.ok(result.includes('/blog/2025/07/07/patterns-for-ai/'));
    });

    it('handles multiple post_url links with mixed tracking', () => {
      const content = `
        Link to [tracked]({% post_url 2025-01-01-tracked-post %})
        Link to [untracked]({% post_url 2025-02-02-untracked-post %})
      `;
      const tracking = {
        '_posts/2025-01-01-tracked-post.markdown': {
          id: 1,
          url: 'https://dev.to/user/tracked-post-abc',
        },
      };
      const result = convertMarkdown(content, tracking);
      assert.ok(result.includes('https://dev.to/user/tracked-post-abc'));
      assert.ok(result.includes('/blog/2025/02/02/untracked-post/'));
    });
  });

  describe('site.url blog links', () => {
    it('converts {{ site.url }}/blog/... to dev.to URL when post exists in tracking', () => {
      const content =
        'Check out [my post]({{ site.url }}/blog/2025/07/07/patterns-for-ai/)';
      const tracking = {
        '_posts/2025-07-07-patterns-for-ai.markdown': {
          id: 123,
          url: 'https://dev.to/javatarz/patterns-for-ai-4ga2',
        },
      };
      const result = convertMarkdown(content, tracking);
      assert.ok(
        result.includes('https://dev.to/javatarz/patterns-for-ai-4ga2'),
      );
      assert.ok(!result.includes('karun.me/blog/2025/07/07/patterns-for-ai/'));
    });

    it('converts {{ site.url }}/blog/... without trailing slash', () => {
      const content =
        'Check out [my post]({{ site.url }}/blog/2025/07/07/patterns-for-ai)';
      const tracking = {
        '_posts/2025-07-07-patterns-for-ai.markdown': {
          id: 123,
          url: 'https://dev.to/javatarz/patterns-for-ai-4ga2',
        },
      };
      const result = convertMarkdown(content, tracking);
      assert.ok(
        result.includes('https://dev.to/javatarz/patterns-for-ai-4ga2'),
      );
    });

    it('preserves anchor fragments when converting to dev.to URL', () => {
      const content =
        'See [section]({{ site.url }}/blog/2025/07/07/patterns-for-ai/#important-section)';
      const tracking = {
        '_posts/2025-07-07-patterns-for-ai.markdown': {
          id: 123,
          url: 'https://dev.to/javatarz/patterns-for-ai-4ga2',
        },
      };
      const result = convertMarkdown(content, tracking);
      assert.ok(
        result.includes(
          'https://dev.to/javatarz/patterns-for-ai-4ga2#important-section',
        ),
      );
    });

    it('falls back to site URL when post not in tracking', () => {
      const content =
        'Check out [my post]({{ site.url }}/blog/2025/07/07/patterns-for-ai/)';
      const tracking = {};
      const result = convertMarkdown(content, tracking);
      assert.ok(result.includes('/blog/2025/07/07/patterns-for-ai/'));
      assert.ok(!result.includes('dev.to'));
    });

    it('handles multiple site.url links with mixed tracking', () => {
      const content = `
        Link to [tracked]({{ site.url }}/blog/2025/01/01/tracked-post/)
        Link to [untracked]({{ site.url }}/blog/2025/02/02/untracked-post/)
      `;
      const tracking = {
        '_posts/2025-01-01-tracked-post.markdown': {
          id: 1,
          url: 'https://dev.to/user/tracked-post-abc',
        },
      };
      const result = convertMarkdown(content, tracking);
      assert.ok(result.includes('https://dev.to/user/tracked-post-abc'));
      assert.ok(result.includes('/blog/2025/02/02/untracked-post/'));
    });

    it('works alongside post_url conversions', () => {
      const content = `
        Using post_url: {% post_url 2025-01-01-post-one %}
        Using site.url: [post two]({{ site.url }}/blog/2025/02/02/post-two/)
      `;
      const tracking = {
        '_posts/2025-01-01-post-one.markdown': {
          id: 1,
          url: 'https://dev.to/user/post-one-abc',
        },
        '_posts/2025-02-02-post-two.markdown': {
          id: 2,
          url: 'https://dev.to/user/post-two-xyz',
        },
      };
      const result = convertMarkdown(content, tracking);
      assert.ok(result.includes('https://dev.to/user/post-one-abc'));
      assert.ok(result.includes('https://dev.to/user/post-two-xyz'));
    });
  });
});
