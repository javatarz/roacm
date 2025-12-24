#!/usr/bin/env node

/**
 * Generate favicon.ico from favicon.svg
 *
 * ICO format is special - it can contain multiple sizes in one file.
 * However, modern browsers accept PNG renamed as ICO.
 * This script creates a proper 32x32 PNG as favicon.ico (most compatible approach without ICO library)
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';

const inputSvg = 'favicon.svg';
const outputIco = 'favicon.ico';

async function generateFavicon() {
  try {
    console.log('📝 Generating favicon.ico from favicon.svg...');

    // Check if source exists
    try {
      readFileSync(inputSvg);
    } catch (error) {
      console.error(`❌ Error: ${inputSvg} not found`);
      process.exit(1);
    }

    // Generate 32x32 PNG (most common favicon size)
    // Save as .ico - modern browsers accept PNG in .ico file
    await sharp(inputSvg)
      .resize(32, 32)
      .png()
      .toFile(outputIco);

    console.log(`✅ Generated ${outputIco} (32x32 PNG format)`);
    console.log('   Note: Modern browsers accept PNG files with .ico extension');

  } catch (error) {
    console.error('❌ Error generating favicon:', error.message);
    process.exit(1);
  }
}

generateFavicon();
