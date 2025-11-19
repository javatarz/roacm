document.addEventListener('DOMContentLoaded', function() {
  // Create button
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
  `;
  button.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(button);

  // Show/hide based on scroll position
  function toggleButton() {
    if (window.pageYOffset > 300) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', toggleButton);
  toggleButton();

  // Scroll to top on click
  button.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
