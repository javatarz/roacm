document.addEventListener('DOMContentLoaded', function () {
  const progressBar = document.querySelector('.reading-progress-bar');

  if (!progressBar) {
    return;
  }

  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const progress = (scrollTop / documentHeight) * 100;

    progressBar.style.width = progress + '%';
  }

  window.addEventListener('scroll', function () {
    requestAnimationFrame(updateProgress);
  });

  updateProgress();
});
