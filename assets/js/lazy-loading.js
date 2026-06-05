// Add native lazy loading to all images except the first in post content (likely LCP)
const postContent = document.querySelector('#main-content .post-content');
const lcpCandidate = postContent && postContent.querySelector('img');

document.querySelectorAll('img').forEach(function (img) {
  if (!img.hasAttribute('loading') && img !== lcpCandidate) {
    img.setAttribute('loading', 'lazy');
  }
});
