#!/usr/bin/env node
/**
 * Minimal static file server for the built Jekyll `_site`.
 *
 * Used as the Playwright `webServer` when STATIC_SERVE=1 (i.e. inside the
 * pinned Playwright Docker container) so visual snapshots render against a
 * prebuilt site without needing Ruby/Jekyll in the container.
 *
 * Serves pretty URLs the way the deployed site does:
 *   /            -> _site/index.html
 *   /blog/x/     -> _site/blog/x/index.html
 *   /blog/x      -> _site/blog/x.html  OR  _site/blog/x/index.html
 *
 * No dependencies — runs on the Node bundled in the Playwright image.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(process.cwd(), '_site');
const PORT = Number(process.env.PORT) || 4000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// Resolve a request path to a file on disk, trying pretty-URL fallbacks.
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const rel = path.normalize(clean).replace(/^(\.\.[/\\])+/, '');
  const base = path.join(ROOT, rel);

  const candidates = [];
  if (clean.endsWith('/')) {
    candidates.push(path.join(base, 'index.html'));
  } else {
    candidates.push(base);
    candidates.push(`${base}.html`);
    candidates.push(path.join(base, 'index.html'));
  }
  for (const c of candidates) {
    // Guard against path traversal outside ROOT.
    if (!c.startsWith(ROOT)) continue;
    try {
      if (fs.statSync(c).isFile()) return c;
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

if (!fs.existsSync(ROOT)) {
  console.error(
    `static-server: _site not found at ${ROOT}. Build the site first.`,
  );
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url || '/');
  if (!file) {
    const notFound = path.join(ROOT, '404.html');
    if (fs.existsSync(notFound)) {
      res.writeHead(404, { 'Content-Type': TYPES['.html'] });
      fs.createReadStream(notFound).pipe(res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
  });
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`static-server: serving ${ROOT} on http://localhost:${PORT}`);
});
