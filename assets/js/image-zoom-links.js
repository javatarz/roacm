// Wrap post images in a self-link so clicking opens the full-size original in
// a new tab. Only wraps when there's actually more detail to see:
//  - raster images (jpg/png/webp/gif) only if the source has real headroom
//    over its displayed size — otherwise "zooming" shows identical pixels.
//  - SVGs always qualify: vector art has no native resolution ceiling, so
//    zooming stays crisp regardless of the display cap.
// Images already inside a link (e.g. hand-wrapped in markdown) are left alone.
const HEADROOM_RATIO = 1.15;

function shouldLinkImage(img) {
  if (img.src.toLowerCase().endsWith('.svg')) {
    return true;
  }
  return img.naturalWidth > img.clientWidth * HEADROOM_RATIO;
}

function wrapImage(img) {
  if (img.closest('a')) {
    return;
  }
  if (!shouldLinkImage(img)) {
    return;
  }

  const link = document.createElement('a');
  link.href = img.currentSrc || img.src;
  link.target = '_blank';
  link.rel = 'noopener';
  img.replaceWith(link);
  link.appendChild(img);
}

document
  .querySelectorAll('#main-content .post-content img')
  .forEach(function (img) {
    if (img.complete) {
      wrapImage(img);
    } else {
      img.addEventListener('load', function () {
        wrapImage(img);
      });
    }
  });
