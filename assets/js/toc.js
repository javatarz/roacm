document.addEventListener('DOMContentLoaded', function () {
  const tocContainer = document.getElementById('toc');
  if (!tocContainer) {
    return;
  }

  // Find all h2 and h3 headings in the article content
  const article = document.querySelector('main');
  if (!article) {
    return;
  }

  const headings = article.querySelectorAll('h2, h3');

  // Only show ToC if there are 3+ headings
  if (headings.length < 3) {
    tocContainer.style.display = 'none';
    return;
  }

  // Ensure all headings have IDs for linking
  headings.forEach(function (heading) {
    if (!heading.id) {
      heading.id =
        'heading-' +
        heading.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
    }
  });

  // Build the ToC HTML
  let tocHTML = '<nav class="toc-nav" aria-label="Table of contents">';
  tocHTML += '<h4 class="toc-title">Contents</h4>';
  tocHTML += '<ul class="toc-list">';

  headings.forEach(function (heading) {
    const level = heading.tagName === 'H2' ? 'toc-h2' : 'toc-h3';
    tocHTML +=
      '<li class="' +
      level +
      '">' +
      '<a href="#' +
      heading.id +
      '" class="toc-link">' +
      heading.textContent +
      '</a></li>';
  });

  tocHTML += '</ul></nav>';
  tocContainer.innerHTML = tocHTML;

  // Highlight current section on scroll
  const tocLinks = tocContainer.querySelectorAll('.toc-link');
  let headingOffsets = [];

  function updateHeadingOffsets() {
    headingOffsets = [];
    headings.forEach(function (heading) {
      headingOffsets.push({
        id: heading.id,
        top: heading.offsetTop,
      });
    });
  }

  function highlightCurrentSection() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    let currentId = null;

    // Find the current section (last heading that's above the viewport top + offset)
    for (let i = 0; i < headingOffsets.length; i++) {
      if (headingOffsets[i].top <= scrollTop + 100) {
        currentId = headingOffsets[i].id;
      }
    }

    // Update active state
    tocLinks.forEach(function (link) {
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Initial setup
  updateHeadingOffsets();
  highlightCurrentSection();

  // Update on scroll
  window.addEventListener(
    'scroll',
    function () {
      requestAnimationFrame(highlightCurrentSection);
    },
    { passive: true },
  );

  // Update offsets on resize
  window.addEventListener(
    'resize',
    function () {
      requestAnimationFrame(updateHeadingOffsets);
    },
    { passive: true },
  );

  // Smooth scroll on click
  tocLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      // Track ToC navigation
      const headingText = this.textContent;
      if (window.UmamiTracker) {
        window.UmamiTracker.track('toc-navigate', {
          heading: headingText,
        });
      }

      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        const offset = target.offsetTop - 20;
        window.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
        // Update URL without jumping
        history.pushState(null, '', '#' + targetId);
      }
    });
  });
});
