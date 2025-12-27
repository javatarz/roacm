(function () {
  'use strict';

  let searchIndex = null;
  let searchData = null;
  let searchInput = null;
  let searchResults = null;
  let searchOverlay = null;

  function createSearchElements() {
    // Create search results container
    searchResults = document.createElement('div');
    searchResults.id = 'search-results';
    searchResults.className = 'search-results';
    searchResults.setAttribute('role', 'listbox');
    searchResults.setAttribute('aria-label', 'Search results');
    document.body.appendChild(searchResults);

    // Create overlay
    searchOverlay = document.createElement('div');
    searchOverlay.id = 'search-overlay';
    searchOverlay.className = 'search-overlay';
    document.body.appendChild(searchOverlay);
  }

  function initSearch() {
    searchInput = document.getElementById('search-input');

    if (!searchInput) {
      return;
    }

    // Create results and overlay elements in body
    createSearchElements();

    // Load search data
    loadSearchData();

    // Event listeners
    searchInput.addEventListener('input', debounce(handleSearch, 200));
    searchInput.addEventListener('focus', function () {
      if (searchInput.value.trim().length >= 2) {
        showResults();
      }
    });

    // Close results when clicking outside
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-container')) {
        hideResults();
      }
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', handleKeydown);

    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hideResults();
        searchInput.blur();
      }
    });

    // Keyboard shortcut: Cmd/Ctrl + K to focus search
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  function loadSearchData() {
    fetch('/search.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        searchData = data;
        buildIndex(data);
      })
      .catch(function (error) {
        console.error('Error loading search data:', error);
      });
  }

  function buildIndex(data) {
    /* global lunr */
    searchIndex = lunr(function () {
      this.ref('url');
      this.field('title', { boost: 10 });
      this.field('excerpt', { boost: 5 });
      this.field('content');
      this.field('categories', { boost: 3 });
      this.field('tags', { boost: 3 });

      data.forEach(function (doc) {
        this.add({
          url: doc.url,
          title: doc.title,
          excerpt: doc.excerpt,
          content: doc.content,
          categories: doc.categories ? doc.categories.join(' ') : '',
          tags: doc.tags ? doc.tags.join(' ') : '',
        });
      }, this);
    });
  }

  function handleSearch() {
    const query = searchInput.value.trim();

    if (query.length < 2) {
      hideResults();
      return;
    }

    if (!searchIndex) {
      searchResults.innerHTML =
        '<div class="search-loading">Loading search...</div>';
      showResults();
      return;
    }

    const results = performSearch(query);
    displayResults(results, query);
  }

  function performSearch(query) {
    try {
      // Try exact match first with wildcards
      let results = searchIndex.search(query + '*');

      // If no results, try fuzzy search
      if (results.length === 0) {
        results = searchIndex.search(query + '~1');
      }

      return results.slice(0, 8); // Limit to 8 results
    } catch {
      // If lunr throws an error (e.g., invalid syntax), try simpler search
      try {
        return searchIndex.search(query).slice(0, 8);
      } catch {
        return [];
      }
    }
  }

  function displayResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML =
        '<div class="search-no-results">No results found for "' +
        escapeHtml(query) +
        '"</div>';
      showResults();
      return;
    }

    const html = results
      .map(function (result, index) {
        const post = searchData.find(function (p) {
          return p.url === result.ref;
        });

        if (!post) {
          return '';
        }

        return (
          '<a href="' +
          post.url +
          '" class="search-result-item' +
          (index === 0 ? ' selected' : '') +
          '" data-index="' +
          index +
          '">' +
          '<div class="search-result-title">' +
          highlightMatch(post.title, query) +
          '</div>' +
          '<div class="search-result-excerpt">' +
          highlightMatch(post.excerpt, query) +
          '</div>' +
          '<div class="search-result-date">' +
          post.date +
          '</div>' +
          '</a>'
        );
      })
      .join('');

    searchResults.innerHTML = html;

    // Track search with results
    if (window.UmamiTracker) {
      window.UmamiTracker.track('search', {
        query: query,
        results_count: results.length,
      });
    }

    showResults();
  }

  function highlightMatch(text, query) {
    if (!text) {
      return '';
    }
    const escaped = escapeHtml(text);
    const regex = new RegExp('(' + escapeRegex(query) + ')', 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function showResults() {
    searchResults.classList.add('visible');
    if (searchOverlay) {
      searchOverlay.classList.add('visible');
    }
  }

  function hideResults() {
    searchResults.classList.remove('visible');
    if (searchOverlay) {
      searchOverlay.classList.remove('visible');
    }
  }

  function handleKeydown(e) {
    const items = searchResults.querySelectorAll('.search-result-item');
    const selected = searchResults.querySelector(
      '.search-result-item.selected',
    );
    const currentIndex = selected ? parseInt(selected.dataset.index, 10) : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(currentIndex + 1, items.length - 1);
      updateSelection(items, nextIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(currentIndex - 1, 0);
      updateSelection(items, prevIndex);
    } else if (e.key === 'Enter' && selected) {
      e.preventDefault();
      window.location.href = selected.href;
    }
  }

  function updateSelection(items, newIndex) {
    items.forEach(function (item, i) {
      item.classList.toggle('selected', i === newIndex);
    });
    // Scroll selected item into view
    if (items[newIndex]) {
      items[newIndex].scrollIntoView({ block: 'nearest' });
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
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
