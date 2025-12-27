document.addEventListener('DOMContentLoaded', function () {
  // Wrap code blocks and add copy button
  document.querySelectorAll('pre').forEach(function (pre) {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.textContent = 'Copy';
    wrapper.appendChild(button);

    button.addEventListener('click', function () {
      const code = pre.textContent;
      navigator.clipboard
        .writeText(code)
        .then(function () {
          button.textContent = 'Copied!';
          button.classList.add('copied');

          // Track successful code copy
          if (window.UmamiTracker) {
            const language = extractLanguage(pre);
            window.UmamiTracker.track('code-copy', { language: language });
          }

          setTimeout(function () {
            button.textContent = 'Copy';
            button.classList.remove('copied');
          }, 2000);
        })
        .catch(function () {
          button.textContent = 'Failed';
          button.classList.add('error');
          setTimeout(function () {
            button.textContent = 'Copy';
            button.classList.remove('error');
          }, 2000);
        });
    });
  });

  /**
   * Extract programming language from code block
   * @param {HTMLElement} preElement - The <pre> element
   * @returns {string} - Language name or 'unknown'
   */
  function extractLanguage(preElement) {
    const codeElement = preElement.querySelector('code');
    if (!codeElement) {
      return 'unknown';
    }

    // Extract from class like "language-javascript" or "highlight-javascript"
    const classes = codeElement.className || '';
    const match = classes.match(/(?:language|highlight)-(\w+)/);
    return match ? match[1] : 'unknown';
  }
});
