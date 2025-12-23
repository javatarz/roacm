# Image Optimization

Images are optimized during CI build (not at source). The pipeline:

1. Jekyll builds the site
2. `scripts/transform-images.mjs` - Transforms `<img>` tags to `<picture>` elements with WebP sources
3. `scripts/optimize-images.mjs` - Converts images to WebP, compresses originals, generates srcset widths

## Key Points

- Source images in `assets/images/` stay at original quality
- New images are automatically optimized on next deploy
- WebP served with PNG/JPG fallbacks for older browsers
- Responsive srcset widths: 640w, 960w, 1280w
