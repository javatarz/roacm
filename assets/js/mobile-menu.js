(function () {
  'use strict';

  // DOM elements
  let hamburgerButton = null;
  let sidebar = null;
  let backdrop = null;
  let lastFocusedElement = null;

  // State
  let isOpen = false;

  // Breakpoint matching desktop threshold
  const MOBILE_BREAKPOINT = 1280;

  function init() {
    hamburgerButton = document.getElementById('hamburger-menu');
    sidebar = document.getElementById('mobile-sidebar');
    backdrop = document.getElementById('sidebar-backdrop');

    if (!hamburgerButton || !sidebar) {
      return;
    }

    // Event listeners
    hamburgerButton.addEventListener('click', toggleMenu);

    if (backdrop) {
      backdrop.addEventListener('click', closeMenu);
    }

    // Close on Escape key
    document.addEventListener('keydown', handleKeydown);

    // Close when clicking navigation links
    sidebar.addEventListener('click', handleSidebarClick);

    // Handle viewport resize
    window.addEventListener('resize', debounce(handleResize, 100), {
      passive: true,
    });
  }

  function toggleMenu() {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    if (isOpen) {
      return;
    }

    isOpen = true;
    lastFocusedElement = document.activeElement;

    // Update ARIA attributes
    hamburgerButton.setAttribute('aria-expanded', 'true');
    hamburgerButton.setAttribute('aria-label', 'Close navigation menu');

    // Show sidebar and backdrop
    sidebar.classList.add('is-open');
    if (backdrop) {
      backdrop.classList.add('visible');
    }

    // Prevent body scroll
    document.body.classList.add('menu-open');

    // Focus first focusable element in sidebar
    const firstFocusable = sidebar.querySelector(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    if (firstFocusable) {
      // Delay focus to allow transition to complete
      setTimeout(function () {
        firstFocusable.focus();
      }, 100);
    }
  }

  function closeMenu() {
    if (!isOpen) {
      return;
    }

    isOpen = false;

    // Update ARIA attributes
    hamburgerButton.setAttribute('aria-expanded', 'false');
    hamburgerButton.setAttribute('aria-label', 'Open navigation menu');

    // Hide sidebar and backdrop
    sidebar.classList.remove('is-open');
    if (backdrop) {
      backdrop.classList.remove('visible');
    }

    // Re-enable body scroll
    document.body.classList.remove('menu-open');

    // Restore focus
    if (lastFocusedElement && lastFocusedElement.focus) {
      lastFocusedElement.focus();
    }
  }

  function handleKeydown(e) {
    if (!isOpen) {
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }

    // Focus trapping
    if (e.key === 'Tab') {
      trapFocus(e);
    }
  }

  function trapFocus(e) {
    const focusableElements = sidebar.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab: going backwards
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab: going forwards
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  function handleSidebarClick(e) {
    // Check if clicked element is a navigation link
    const link = e.target.closest('a[href]');
    if (link) {
      // Allow the navigation to happen, then close menu
      closeMenu();
    }
  }

  function handleResize() {
    // Auto-close menu if viewport expands past mobile breakpoint
    if (window.innerWidth >= MOBILE_BREAKPOINT && isOpen) {
      closeMenu();
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
