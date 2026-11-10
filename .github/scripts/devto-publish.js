const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DEVTO_API_URL = 'https://dev.to/api/articles';
const TRACKING_FILE = '.devto-posts.json';
const SITE_URL = process.env.SITE_URL;

function loadTracking() {
  if (fs.existsSync(TRACKING_FILE)) {
    return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
  }
  return {};
}

function saveTracking(tracking) {
  fs.writeFileSync(TRACKING_FILE, JSON.stringify(tracking, null, 2) + '\n');
}

function convertMarkdown(content, tracking = {}) {
  let converted = content;
  converted = converted.replace(/<!--\s*more\s*-->/gi, '');
  // Strip Kramdown/Jekyll attributes (e.g., {: .class #id})
  converted = converted.replace(/\{:\s*[^}]+\}/g, '');
  converted = converted.replace(
    /\{%\s*highlight\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endhighlight\s*%\}/g,
    (match, lang, code) => `\`\`\`${lang}\n${code.trim()}\n\`\`\``,
  );
  converted = converted.replace(
    /\{%\s*post_url\s+(\d{4})-(\d{2})-(\d{2})-([^\s%]+)\s*%\}/g,
    (match, year, month, day, slug) => {
      // Check if the linked post exists on dev.to
      const postPath = `_posts/${year}-${month}-${day}-${slug}.markdown`;
      if (tracking[postPath]?.url) {
        return tracking[postPath].url;
      }
      return `${SITE_URL}/blog/${year}/${month}/${day}/${slug}/`;
    },
  );
  converted = converted.replace(
    /\{%\s*include\s+youtube\.html\s+id="([^"]+)"(?:\s+title="([^"]+)")?\s*%\}/g,
    (match, id) => `{% embed https://www.youtube.com/watch?v=${id} %}`,
  );
  // Replace {{ site.url }}/blog/YYYY/MM/DD/slug/ links with dev.to URLs if available
  converted = converted.replace(
    /\{\{\s*site\.url\s*\}\}\/blog\/(\d{4})\/(\d{2})\/(\d{2})\/([^/\s)#]+)\/?/g,
    (match, year, month, day, slug) => {
      const postPath = `_posts/${year}-${month}-${day}-${slug}.markdown`;
      if (tracking[postPath]?.url) {
        // Remove trailing slash from dev.to URL to avoid /# before anchors
        return tracking[postPath].url.replace(/\/$/, '');
      }
      return `${SITE_URL}/blog/${year}/${month}/${day}/${slug}/`;
    },
  );
  converted = converted.replace(/\{\{\s*site\.url\s*\}\}/g, SITE_URL);
  converted = converted.replace(/\{\{\s*site\.excerpt_separator\s*\}\}/g, '');
  converted = converted.replace(
    /!\[([^\]]*)\]\((?!http)([^)]+)\)/g,
    (match, alt, src) => {
      const absoluteSrc = src.startsWith('/')
        ? `${SITE_URL}${src}`
        : `${SITE_URL}/${src}`;
      return `![${alt}](${absoluteSrc})`;
    },
  );
  converted = converted.replace(
    /\[([^\]]+)\]\((?!http|#)([^)]+)\)/g,
    (match, text, href) => {
      const absoluteHref = href.startsWith('/')
        ? `${SITE_URL}${href}`
        : `${SITE_URL}/${href}`;
      return `[${text}](${absoluteHref})`;
    },
  );
  return converted.trim();
}

function parsePostFilename(postPath) {
  const filename = path.basename(postPath, '.markdown');
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
  if (!match) {
    throw new Error(`Invalid post filename format: ${postPath}`);
  }
  const [, year, month, day, slug] = match;
  return { year, month, day, slug };
}

function getCanonicalUrl(postPath) {
  const { year, month, day, slug } = parsePostFilename(postPath);
  return `${SITE_URL}/blog/${year}/${month}/${day}/${slug}/`;
}

function getPostDate(postPath) {
  const { year, month, day } = parsePostFilename(postPath);
  // Parse as UTC midnight (start of day)
  return new Date(`${year}-${month}-${day}T00:00:00Z`);
}

function isFuturePost(postPath) {
  const postDate = getPostDate(postPath);
  return postDate > new Date();
}

async function createArticle(article) {
  const response = await fetch(DEVTO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': process.env.DEVTO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ article }),
  });
  if (!response.ok) {
    const error = await response.text();
    const err = new Error(`dev.to API error (${response.status}): ${error}`);
    err.status = response.status;
    err.body = error;
    throw err;
  }
  return response.json();
}

// dev.to rejects a create with 422 when the canonical URL is already used, which
// happens when an earlier run created the article but its tracking entry never
// landed on main.
function isCanonicalTakenError(error) {
  return (
    error?.status === 422 &&
    /canonical url has already been taken/i.test(error.body || '')
  );
}

function normalizeUrl(url) {
  return String(url || '').replace(/\/+$/, '');
}

function findArticleByCanonical(articles, canonicalUrl) {
  const wanted = normalizeUrl(canonicalUrl);
  return (articles || []).find((a) => normalizeUrl(a.canonical_url) === wanted);
}

async function listOwnArticles() {
  const articles = [];
  for (let page = 1; page <= 20; page += 1) {
    const response = await fetch(
      `${DEVTO_API_URL}/me/all?per_page=100&page=${page}`,
      { headers: { 'api-key': process.env.DEVTO_API_KEY } },
    );
    if (!response.ok) {
      throw new Error(`dev.to API error (${response.status}) listing articles`);
    }
    const batch = await response.json();
    articles.push(...batch);
    if (batch.length < 100) {
      break;
    }
  }
  return articles;
}

// dev.to rate limits creates (429 "Retry later"); back off and try again rather
// than failing the whole run and losing the tracking entries gathered so far.
async function withRetry(fn, options = {}) {
  const {
    retries = 3,
    delayMs = 30000,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = options;
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (error?.status !== 429 || attempt >= retries) {
        throw error;
      }
      console.log(
        `⏳ Rate limited, retrying in ${(delayMs * (attempt + 1)) / 1000}s...`,
      );
      await sleep(delayMs * (attempt + 1));
    }
  }
}

function getPostsToProcess() {
  const manualPath = process.env.POST_PATH;
  if (manualPath) {
    const resolved = path.resolve(manualPath);
    if (!resolved.startsWith(path.resolve('_posts') + path.sep)) {
      throw new Error(`POST_PATH must be inside _posts/: ${manualPath}`);
    }
    return [manualPath];
  }
  // Always check all posts - the main() function filters by devto: true
  // and tracking file to determine what actually needs publishing
  return fs
    .readdirSync('_posts')
    .filter((f) => f.endsWith('.markdown'))
    .map((f) => `_posts/${f}`);
}

async function main() {
  const tracking = loadTracking();
  const posts = getPostsToProcess();
  console.log(`Found ${posts.length} post(s) to check`);
  let hasChanges = false;

  for (const postPath of posts) {
    if (!fs.existsSync(postPath)) {
      console.log(`Skipping ${postPath} - file not found`);
      continue;
    }
    const fileContent = fs.readFileSync(postPath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    if (!frontmatter.devto) {
      console.log(`Skipping ${postPath} - devto: true not set`);
      continue;
    }
    if (frontmatter.published === false) {
      console.log(`Skipping ${postPath} - published: false (draft)`);
      continue;
    }
    if (isFuturePost(postPath)) {
      const postDate = getPostDate(postPath);
      console.log(
        `Skipping ${postPath} - future post (${postDate.toISOString().split('T')[0]})`,
      );
      continue;
    }
    if (tracking[postPath]) {
      console.log(
        `Skipping ${postPath} - already posted (ID: ${tracking[postPath].id})`,
      );
      continue;
    }

    console.log(`Creating ${postPath}...`);
    const canonicalUrl = getCanonicalUrl(postPath);
    const convertedContent = convertMarkdown(content, tracking);

    const article = {
      title: frontmatter.title,
      body_markdown: convertedContent,
      canonical_url: canonicalUrl,
      published: true,
    };
    if (frontmatter.description) {
      article.description = frontmatter.description;
    }
    const tags = frontmatter.devto_tags || frontmatter.tags;
    if (tags && Array.isArray(tags)) {
      article.tags = tags
        .slice(0, 4)
        .map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }

    try {
      const result = await withRetry(() => createArticle(article));
      console.log(`✅ Created: ${result.url}`);
      tracking[postPath] = {
        id: result.id,
        url: result.url,
        posted_at: new Date().toISOString(),
      };
      hasChanges = true;
      await new Promise((resolve) => setTimeout(resolve, 15000));
    } catch (error) {
      if (isCanonicalTakenError(error)) {
        const existing = findArticleByCanonical(
          await listOwnArticles(),
          canonicalUrl,
        );
        if (existing) {
          console.log(
            `ℹ️  Already on dev.to, recording existing article: ${existing.url}`,
          );
          tracking[postPath] = {
            id: existing.id,
            url: existing.url,
            posted_at: existing.published_at || new Date().toISOString(),
          };
          hasChanges = true;
          continue;
        }
      }
      console.error(`❌ Failed to create ${postPath}: ${error.message}`);
      if (hasChanges) {
        // Keep what was recorded before the failure so it is not lost.
        saveTracking(tracking);
        console.log('Tracking file updated (partial)');
      }
      process.exit(1);
    }
  }

  if (hasChanges) {
    saveTracking(tracking);
    console.log('Tracking file updated');
  } else {
    console.log('No new posts to publish');
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parsePostFilename,
    getPostDate,
    isFuturePost,
    getCanonicalUrl,
    convertMarkdown,
    isCanonicalTakenError,
    findArticleByCanonical,
    withRetry,
  };
}

// Run main only when executed directly
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
