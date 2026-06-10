document.addEventListener('DOMContentLoaded', function () {
  // Single visually-hidden aria-live region shared by all copy buttons
  const ariaAnnouncer = document.createElement('span');
  ariaAnnouncer.setAttribute('aria-live', 'polite');
  ariaAnnouncer.setAttribute('aria-atomic', 'true');
  ariaAnnouncer.style.cssText =
    'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
  document.body.appendChild(ariaAnnouncer);

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
          ariaAnnouncer.textContent = 'Copied to clipboard';

          // Track successful code copy
          if (window.UmamiTracker) {
            const language = extractLanguage(pre);
            window.UmamiTracker.track('code-copy', { language: language });
          }

          setTimeout(function () {
            button.textContent = 'Copy';
            button.classList.remove('copied');
            ariaAnnouncer.textContent = '';
          }, 2000);
        })
        .catch(function () {
          button.textContent = 'Failed';
          button.classList.add('error');
          ariaAnnouncer.textContent = 'Copy failed';
          setTimeout(function () {
            button.textContent = 'Copy';
            button.classList.remove('error');
            ariaAnnouncer.textContent = '';
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
