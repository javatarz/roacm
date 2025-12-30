/* global require, process */
/* eslint-disable no-console */
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

function convertMarkdown(content) {
  let converted = content;
  converted = converted.replace(/<!--\s*more\s*-->/gi, '');
  converted = converted.replace(
    /\{%\s*highlight\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endhighlight\s*%\}/g,
    (match, lang, code) => `\`\`\`${lang}\n${code.trim()}\n\`\`\``,
  );
  converted = converted.replace(
    /\{%\s*post_url\s+(\d{4})-(\d{2})-(\d{2})-([^\s%]+)\s*%\}/g,
    (match, year, month, day, slug) =>
      `${SITE_URL}/blog/${year}/${month}/${day}/${slug}/`,
  );
  converted = converted.replace(
    /\{%\s*include\s+youtube\.html\s+id="([^"]+)"(?:\s+title="([^"]+)")?\s*%\}/g,
    (match, id) => `{% embed https://www.youtube.com/watch?v=${id} %}`,
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

function getCanonicalUrl(postPath) {
  const filename = path.basename(postPath, '.markdown');
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
  if (!match) {
    throw new Error(`Invalid post filename format: ${postPath}`);
  }
  const [, year, month, day, slug] = match;
  return `${SITE_URL}/blog/${year}/${month}/${day}/${slug}/`;
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
    throw new Error(`dev.to API error (${response.status}): ${error}`);
  }
  return response.json();
}

function getPostsToProcess() {
  const manualPath = process.env.POST_PATH;
  if (manualPath) {
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
    if (tracking[postPath]) {
      console.log(
        `Skipping ${postPath} - already posted (ID: ${tracking[postPath].id})`,
      );
      continue;
    }

    console.log(`Creating ${postPath}...`);
    const canonicalUrl = getCanonicalUrl(postPath);
    const convertedContent = convertMarkdown(content);

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
      const result = await createArticle(article);
      console.log(`✅ Created: ${result.url}`);
      tracking[postPath] = {
        id: result.id,
        url: result.url,
        posted_at: new Date().toISOString(),
      };
      hasChanges = true;
      await new Promise((resolve) => setTimeout(resolve, 15000));
    } catch (error) {
      console.error(`❌ Failed to create ${postPath}: ${error.message}`);
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
