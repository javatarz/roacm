document.addEventListener('DOMContentLoaded', function () {
  const progressBar = document.querySelector('.reading-progress-bar');

  if (!progressBar) {
    return;
  }

  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Guard against NaN/Infinity when page is shorter than viewport
    if (documentHeight <= 0) {
      progressBar.style.width = '100%';
      return;
    }

    const progress = (scrollTop / documentHeight) * 100;

    progressBar.style.width = progress + '%';
  }

  window.addEventListener(
    'scroll',
    function () {
      requestAnimationFrame(updateProgress);
    },
    { passive: true },
  );

  updateProgress();
});
