#!/usr/bin/env node
/**
 * Image Optimization Script
 *
 * Processes images in _site/assets/images/ after Jekyll build:
 * - Converts PNG/JPG to WebP format
 * - Generates responsive srcset widths (640w, 960w, 1280w)
 * - Compresses original formats as fallbacks
 *
 * Run after Jekyll build: npm run images:optimize
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import { join, extname, basename, dirname } from 'node:path';
import { existsSync } from 'node:fs';

const SITE_IMAGES_DIR = '_site/assets/images';
const SRCSET_WIDTHS = [640, 960, 1280];
const WEBP_QUALITY_PHOTO = 80;
const WEBP_QUALITY_DIAGRAM = 90;
const JPG_QUALITY = 85;
const SMALL_IMAGE_THRESHOLD = 50 * 1024; // 50KB - skip srcset for small images

// Track statistics
const stats = {
  processed: 0,
  skipped: 0,
  totalOriginalSize: 0,
  totalOptimizedSize: 0,
  webpGenerated: 0,
  srcsetGenerated: 0,
};

/**
 * Check if file is an image we should process
 */
function isProcessableImage(filename) {
  const ext = extname(filename).toLowerCase();
  // Skip already-processed files (those with -NNNw suffix)
  if (/-\d+w\.(webp|jpg|jpeg|png)$/i.test(filename)) {
    return false;
  }
  // Skip WebP files (they're output, not input)
  if (ext === '.webp') {
    return false;
  }
  return ['.png', '.jpg', '.jpeg'].includes(ext);
}

/**
 * Determine if image is photographic (JPG or large PNG) vs diagram/screenshot
 */
async function isPhotographic(filePath, metadata) {
  const ext = extname(filePath).toLowerCase();
  // JPGs are always photographic
  if (ext === '.jpg' || ext === '.jpeg') {
    return true;
  }
  // Large PNGs (>1000px width) are likely photos
  if (metadata.width > 1000) {
    return true;
  }
  return false;
}

/**
 * Process a single image file
 */
async function processImage(filePath) {
  const filename = basename(filePath);
  const dir = dirname(filePath);
  const ext = extname(filename).toLowerCase();
  const nameWithoutExt = basename(filename, ext);

  try {
    const fileStats = await stat(filePath);
    const originalSize = fileStats.size;
    stats.totalOriginalSize += originalSize;

    const image = sharp(filePath);
    const metadata = await image.metadata();
    const isPhoto = await isPhotographic(filePath, metadata);
    const webpQuality = isPhoto ? WEBP_QUALITY_PHOTO : WEBP_QUALITY_DIAGRAM;

    console.log(`Processing: ${filePath} (${formatBytes(originalSize)})`);

    // Generate WebP version at original size
    const webpPath = join(dir, `${nameWithoutExt}.webp`);
    await sharp(filePath).webp({ quality: webpQuality }).toFile(webpPath);

    const webpStats = await stat(webpPath);
    stats.totalOptimizedSize += webpStats.size;
    stats.webpGenerated++;
    console.log(`  -> WebP: ${formatBytes(webpStats.size)} (${calculateSavings(originalSize, webpStats.size)}% smaller)`);

    // Compress original format as fallback
    let fallbackSize = originalSize;
    if (ext === '.jpg' || ext === '.jpeg') {
      await sharp(filePath).jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toFile(filePath + '.tmp');
      await renameFile(filePath + '.tmp', filePath);
      const newStats = await stat(filePath);
      fallbackSize = newStats.size;
      console.log(`  -> JPG compressed: ${formatBytes(fallbackSize)}`);
    } else if (ext === '.png') {
      await sharp(filePath).png({ compressionLevel: 9, palette: !isPhoto }).toFile(filePath + '.tmp');
      await renameFile(filePath + '.tmp', filePath);
      const newStats = await stat(filePath);
      fallbackSize = newStats.size;
      console.log(`  -> PNG compressed: ${formatBytes(fallbackSize)}`);
    }

    // Generate srcset versions (skip for small images)
    if (originalSize > SMALL_IMAGE_THRESHOLD) {
      for (const width of SRCSET_WIDTHS) {
        // Skip if image is smaller than target width
        if (metadata.width <= width) {
          continue;
        }

        // WebP srcset
        const srcsetWebpPath = join(dir, `${nameWithoutExt}-${width}w.webp`);
        await sharp(filePath).resize(width).webp({ quality: webpQuality }).toFile(srcsetWebpPath);
        stats.srcsetGenerated++;

        // Original format srcset (for fallback)
        const srcsetFallbackPath = join(dir, `${nameWithoutExt}-${width}w${ext}`);
        if (ext === '.jpg' || ext === '.jpeg') {
          await sharp(filePath).resize(width).jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toFile(srcsetFallbackPath);
        } else {
          await sharp(filePath).resize(width).png({ compressionLevel: 9, palette: !isPhoto }).toFile(srcsetFallbackPath);
        }
        stats.srcsetGenerated++;

        const srcsetStats = await stat(srcsetWebpPath);
        console.log(`  -> ${width}w WebP: ${formatBytes(srcsetStats.size)}`);
      }
    } else {
      console.log(`  -> Skipping srcset (small image)`);
    }

    stats.processed++;
  } catch (error) {
    console.error(`  Error processing ${filePath}: ${error.message}`);
    stats.skipped++;
  }
}

/**
 * Rename file (cross-platform)
 */
async function renameFile(from, to) {
  const { rename } = await import('node:fs/promises');
  await rename(from, to);
}

/**
 * Recursively find all images in directory
 */
async function findImages(dir, images = []) {
  if (!existsSync(dir)) {
    return images;
  }

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await findImages(fullPath, images);
    } else if (isProcessableImage(entry.name)) {
      images.push(fullPath);
    }
  }

  return images;
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Calculate percentage savings
 */
function calculateSavings(original, optimized) {
  return Math.round((1 - optimized / original) * 100);
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Image Optimization Pipeline');
  console.log('='.repeat(60));
  console.log(`Source directory: ${SITE_IMAGES_DIR}`);
  console.log('');

  if (!existsSync(SITE_IMAGES_DIR)) {
    console.error(`Error: Directory ${SITE_IMAGES_DIR} does not exist.`);
    console.error('Run Jekyll build first: bundle exec jekyll build');
    process.exit(1);
  }

  const images = await findImages(SITE_IMAGES_DIR);
  console.log(`Found ${images.length} images to process\n`);

  for (const imagePath of images) {
    await processImage(imagePath);
    console.log('');
  }

  // Print summary
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Images processed: ${stats.processed}`);
  console.log(`Images skipped: ${stats.skipped}`);
  console.log(`WebP versions created: ${stats.webpGenerated}`);
  console.log(`Srcset versions created: ${stats.srcsetGenerated}`);
  console.log(`Original total size: ${formatBytes(stats.totalOriginalSize)}`);
  console.log(`WebP total size: ${formatBytes(stats.totalOptimizedSize)}`);

  if (stats.totalOriginalSize > 0) {
    const savings = calculateSavings(stats.totalOriginalSize, stats.totalOptimizedSize);
    console.log(`Estimated savings: ${savings}%`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
