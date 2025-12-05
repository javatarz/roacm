#!/usr/bin/env node
/**
 * HTML Image Transform Script
 *
 * Transforms <img> tags in built HTML files to <picture> elements with:
 * - WebP source with srcset for responsive images
 * - Original format fallback
 * - lazy loading and decoding attributes
 *
 * Run after Jekyll build, before image optimization:
 *   npm run images:transform
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname, basename, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const SITE_DIR = '_site';
const IMAGES_DIR = '_site/assets/images';
const SRCSET_WIDTHS = [640, 960, 1280];

// Track statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  imagesTransformed: 0,
};

// Cache for image dimensions
const imageDimensionsCache = new Map();

/**
 * Get image dimensions (cached)
 */
async function getImageDimensions(imagePath) {
  if (imageDimensionsCache.has(imagePath)) {
    return imageDimensionsCache.get(imagePath);
  }

  const fullPath = join(SITE_DIR, imagePath);
  if (!existsSync(fullPath)) {
    return null;
  }

  try {
    const metadata = await sharp(fullPath).metadata();
    const dimensions = { width: metadata.width, height: metadata.height };
    imageDimensionsCache.set(imagePath, dimensions);
    return dimensions;
  } catch {
    return null;
  }
}

/**
 * Generate srcset string for an image
 */
function generateSrcset(imagePath, imageWidth, format) {
  const ext = extname(imagePath);
  const dir = dirname(imagePath);
  const name = basename(imagePath, ext);

  const srcsetParts = [];

  // Add responsive widths that are smaller than the original
  for (const width of SRCSET_WIDTHS) {
    if (imageWidth > width) {
      const resizedName = `${name}-${width}w.${format}`;
      srcsetParts.push(`${dir}/${resizedName} ${width}w`);
    }
  }

  // Add original size (capped at largest srcset width for naming)
  const originalName = `${name}.${format}`;
  srcsetParts.push(`${dir}/${originalName} ${imageWidth}w`);

  return srcsetParts.join(', ');
}

/**
 * Extract the path portion from a URL that contains /assets/images/
 * Handles both relative paths and full URLs
 */
function extractAssetPath(src) {
  // Check for /assets/images/ anywhere in the URL
  const assetMatch = src.match(/\/assets\/images\/[^"'\s]*/);
  if (assetMatch) {
    return assetMatch[0];
  }
  return null;
}

/**
 * Transform a single img tag to picture element
 */
async function transformImgTag(imgTag) {
  // Extract src attribute
  const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
  if (!srcMatch) {
    return imgTag;
  }

  const src = srcMatch[1];

  // Extract the asset path - handles both relative and full URLs
  // e.g., "/assets/images/uploads/foo.jpg" or "https://blog.karun.me/assets/images/uploads/foo.jpg"
  const assetPath = extractAssetPath(src);
  if (!assetPath) {
    return imgTag;
  }

  // Skip already-transformed srcset images
  if (/-\d+w\.(webp|jpg|jpeg|png)$/i.test(assetPath)) {
    return imgTag;
  }

  // Normalize path (remove leading slash for filesystem access)
  const normalizedPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const fullImagePath = join(SITE_DIR, normalizedPath);

  if (!existsSync(fullImagePath)) {
    console.log(`  Skipping: ${src} (file not found at ${fullImagePath})`);
    return imgTag;
  }

  // Get image dimensions
  const dimensions = await getImageDimensions(normalizedPath);
  if (!dimensions) {
    console.log(`  Skipping: ${src} (couldn't read dimensions)`);
    return imgTag;
  }

  // Extract other attributes
  const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
  const classMatch = imgTag.match(/class=["']([^"']*)["']/);
  const styleMatch = imgTag.match(/style=["']([^"']*)["']/);
  const titleMatch = imgTag.match(/title=["']([^"']*)["']/);

  const alt = altMatch ? altMatch[1] : '';
  const classAttr = classMatch ? ` class="${classMatch[1]}"` : '';
  const styleAttr = styleMatch ? ` style="${styleMatch[1]}"` : '';
  const titleAttr = titleMatch ? ` title="${titleMatch[1]}"` : '';

  // Use the extracted asset path for srcset generation (always relative)
  const webpSrcset = generateSrcset(assetPath, dimensions.width, 'webp');

  // Build the picture element
  // Sizes: responsive - full width on mobile, capped at 768px on larger screens
  const sizes = '(max-width: 768px) 100vw, 768px';

  // Keep the original src for the fallback img (maintains full URL if that's what was used)
  const picture = `<picture>
  <source type="image/webp"
    srcset="${webpSrcset}"
    sizes="${sizes}">
  <img src="${src}" alt="${alt}"${classAttr}${styleAttr}${titleAttr}
    loading="lazy" decoding="async"
    width="${dimensions.width}" height="${dimensions.height}">
</picture>`;

  stats.imagesTransformed++;
  console.log(`  Transformed: ${src}`);

  return picture;
}

/**
 * Process a single HTML file
 */
async function processHtmlFile(filePath) {
  const content = await readFile(filePath, 'utf-8');

  // Find all img tags (including self-closing and multi-line)
  const imgRegex = /<img\s+[^>]*src=["'][^"']+["'][^>]*\/?>/gi;
  const matches = content.match(imgRegex);

  if (!matches || matches.length === 0) {
    return;
  }

  let newContent = content;
  let modified = false;

  for (const imgTag of matches) {
    // Skip if already inside a picture element
    const imgIndex = newContent.indexOf(imgTag);
    if (imgIndex === -1) continue;

    // Check if this img is already inside a <picture> element
    const before = newContent.slice(Math.max(0, imgIndex - 200), imgIndex);
    if (before.includes('<picture') && !before.includes('</picture>')) {
      continue;
    }

    const transformed = await transformImgTag(imgTag);
    if (transformed !== imgTag) {
      newContent = newContent.replace(imgTag, transformed);
      modified = true;
    }
  }

  if (modified) {
    await writeFile(filePath, newContent, 'utf-8');
    stats.filesModified++;
  }
}

/**
 * Recursively find all HTML files
 */
async function findHtmlFiles(dir, files = []) {
  if (!existsSync(dir)) {
    return files;
  }

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await findHtmlFiles(fullPath, files);
    } else if (extname(entry.name).toLowerCase() === '.html') {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('HTML Image Transformation');
  console.log('='.repeat(60));
  console.log(`Site directory: ${SITE_DIR}`);
  console.log('');

  if (!existsSync(SITE_DIR)) {
    console.error(`Error: Directory ${SITE_DIR} does not exist.`);
    console.error('Run Jekyll build first: bundle exec jekyll build');
    process.exit(1);
  }

  const htmlFiles = await findHtmlFiles(SITE_DIR);
  console.log(`Found ${htmlFiles.length} HTML files to scan\n`);

  for (const htmlFile of htmlFiles) {
    console.log(`Scanning: ${htmlFile}`);
    stats.filesScanned++;
    await processHtmlFile(htmlFile);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`HTML files scanned: ${stats.filesScanned}`);
  console.log(`HTML files modified: ${stats.filesModified}`);
  console.log(`Images transformed: ${stats.imagesTransformed}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
