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
      navigator.clipboard.writeText(code).then(function () {
        button.textContent = 'Copied!';
        button.classList.add('copied');
        setTimeout(function () {
          button.textContent = 'Copy';
          button.classList.remove('copied');
        }, 2000);
      });
    });
  });
});
