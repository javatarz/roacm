#!/usr/bin/env node

/**
 * Export blog post to WYSIWYG-friendly HTML
 *
 * Converts markdown posts to clean HTML suitable for pasting into
 * Medium, LinkedIn, and other WYSIWYG editors.
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const BASE_URL = 'https://karun.me';

/**
 * Parse frontmatter and content from markdown file
 */
function parseFrontmatter(fileContent) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    throw new Error('No frontmatter found in file');
  }

  const [, frontmatterText, content] = match;
  const frontmatter = {};

  // Parse YAML frontmatter
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      // Handle quoted strings
      const cleanValue = value.replace(/^["']|["']$/g, '');

      if (key === 'tags') {
        // Tags might be on next lines in YAML array format
        frontmatter.tags = [];
      } else if (line.startsWith('  - ') && frontmatter.tags) {
        // YAML array item for tags
        frontmatter.tags.push(line.substring(4).trim());
      } else {
        frontmatter[key] = cleanValue;
      }
    } else if (line.startsWith('  - ') && frontmatter.tags) {
      // Continuation of tags array
      frontmatter.tags.push(line.substring(4).trim());
    }
  });

  return { frontmatter, content: content.trim() };
}

/**
 * Format date from YYYY-MM-DD to "Month DD, YYYY"
 */
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Convert relative URLs to absolute
 */
function makeUrlsAbsolute(html, baseUrl) {
  // Convert relative links: [text](/blog/...)
  html = html.replace(/href=["'](?!http|#|mailto:)([^"']+)["']/g, (match, url) => {
    const absoluteUrl = url.startsWith('/') ? baseUrl + url : baseUrl + '/' + url;
    return `href="${absoluteUrl}"`;
  });

  // Convert relative images: src="/assets/..."
  html = html.replace(/src=["'](?!http|data:)([^"']+)["']/g, (match, url) => {
    const absoluteUrl = url.startsWith('/') ? baseUrl + url : baseUrl + '/' + url;
    return `src="${absoluteUrl}"`;
  });

  return html;
}

/**
 * Process Jekyll/Liquid tags
 */
function processJekyllTags(content) {
  // Remove <!-- more --> comment
  content = content.replace(/<!--\s*more\s*-->/g, '');

  // Convert {% highlight lang %} ... {% endhighlight %} to markdown code blocks
  content = content.replace(/\{%\s*highlight\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endhighlight\s*%\}/g,
    (match, lang, code) => {
      return '```' + lang + '\n' + code.trim() + '\n```';
    }
  );

  // Strip {% include ... %} tags (can't easily render these without Jekyll)
  content = content.replace(/\{%\s*include\s+[^%]*%\}/g, '');

  // Strip other liquid tags we can't process
  content = content.replace(/\{%[^%]*%\}/g, '');
  content = content.replace(/\{\{[^}]*\}\}/g, '');

  return content;
}

/**
 * Simple markdown to HTML converter
 * Uses available Node.js capabilities without external dependencies
 */
function markdownToHtml(markdown) {
  let html = markdown;

  // Process code blocks first (before other conversions)
  const codeBlocks = [];
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    const langClass = lang ? ` class="language-${lang}"` : '';
    codeBlocks.push(`<pre><code${langClass}>${escapeHtml(code.trim())}</code></pre>`);
    return placeholder;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers (process from most specific to least)
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*\*([^\*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  html = html.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Unordered lists
  html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

  // Line breaks and paragraphs
  html = html.split('\n\n').map(para => {
    para = para.trim();
    if (!para) return '';
    // Don't wrap if it's a block-level HTML element (not inline like <strong>, <em>, <a>)
    const blockTags = /^<(h[1-6]|p|div|ul|ol|li|blockquote|pre|hr|table)/i;
    if (blockTags.test(para)) return para;
    // Use div with bottom margin for better RTF conversion
    return `<div style="margin-bottom:1em">${para}</div>`;
  }).join('\n');

  // Fix paragraphs that got split by single newlines after headers
  // Match: </h4>\nText that should be in paragraph
  html = html.replace(/(<\/h[1-6]>)\n([^<\n][^\n]+)/g, '$1\n<p>$2</p>');

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    html = html.replace(`__CODE_BLOCK_${i}__`, block);
  });

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Build the final HTML with metadata header
 */
function buildFinalHtml(frontmatter, contentHtml) {
  const title = frontmatter.title || 'Untitled';
  const date = frontmatter.date ? formatDate(frontmatter.date.split(' ')[0]) : '';
  const tags = frontmatter.tags && frontmatter.tags.length > 0
    ? 'Tags: ' + frontmatter.tags.join(', ')
    : '';

  let html = `<h1>${title}</h1>\n`;

  if (date) {
    html += `<p><em>${date}</em></p>\n`;
  }

  if (tags) {
    html += `<p>${tags}</p>\n`;
  }

  html += `\n<hr>\n\n${contentHtml}`;

  return html;
}

/**
 * Copy HTML to clipboard with proper MIME type (like Google Docs does)
 * This allows WYSIWYG editors to interpret it as formatted content
 */
function copyToClipboard(html) {
  try {
    // Write HTML to a temporary file
    const tmpFile = '/tmp/export-post.html';
    fs.writeFileSync(tmpFile, html, 'utf-8');

    // Use textutil to convert HTML to RTF, then copy both formats to clipboard
    // This mimics what Google Docs does - provides multiple clipboard formats
    const tmpRtf = '/tmp/export-post.rtf';
    execSync(`textutil -convert rtf -stdout "${tmpFile}" > "${tmpRtf}"`);

    // Use osascript to set clipboard with both HTML and RTF data
    // Write the AppleScript to a file to avoid quoting issues
    const scriptFile = '/tmp/export-post.scpt';
    const script = `set htmlData to read (POSIX file "${tmpFile}") as «class HTML»
set rtfData to read (POSIX file "${tmpRtf}") as «class RTF »
set the clipboard to {«class HTML»:htmlData, «class RTF »:rtfData}`;

    fs.writeFileSync(scriptFile, script, 'utf-8');
    execSync(`osascript "${scriptFile}"`);

    // Clean up temp files
    fs.unlinkSync(tmpFile);
    fs.unlinkSync(tmpRtf);
    fs.unlinkSync(scriptFile);

    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error.message);
    return false;
  }
}

/**
 * Extract date from filename (YYYY-MM-DD-title.markdown)
 */
function extractDateFromFilename(filePath) {
  const filename = path.basename(filePath);
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})-/);
  return dateMatch ? dateMatch[1] : null;
}

/**
 * Main conversion function
 */
function convertPost(filePath) {
  // Read file
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Parse frontmatter and content
  const { frontmatter, content } = parseFrontmatter(fileContent);

  // Extract date from filename if not in frontmatter
  if (!frontmatter.date) {
    const dateFromFilename = extractDateFromFilename(filePath);
    if (dateFromFilename) {
      frontmatter.date = dateFromFilename;
    }
  }

  // Process Jekyll tags
  const processedContent = processJekyllTags(content);

  // Convert markdown to HTML
  let html = markdownToHtml(processedContent);

  // Make URLs absolute
  html = makeUrlsAbsolute(html, BASE_URL);

  // Build final HTML with metadata
  const finalHtml = buildFinalHtml(frontmatter, html);

  // Copy to clipboard
  const copied = copyToClipboard(finalHtml);

  return { success: copied, html: finalHtml, frontmatter };
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node export-post.mjs <post-file-path>');
  process.exit(1);
}

const filePath = process.argv[2];

if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found: ${filePath}`);
  process.exit(1);
}

try {
  const { success, html, frontmatter } = convertPost(filePath);

  if (success) {
    console.log('✓ HTML copied to clipboard!');
  } else {
    console.log('⚠ Could not copy to clipboard. Here is the HTML:\n');
    console.log(html);
  }

  process.exit(0);
} catch (error) {
  console.error('Error converting post:', error.message);
  process.exit(1);
}
