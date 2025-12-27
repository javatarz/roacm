/**
 * Umami event tracking utility
 * Provides safe wrapper around umami.track() that:
 * - Checks if Umami is loaded (production only)
 * - Provides consistent error handling
 * - Sanitizes event data
 */
(function (window) {
  'use strict';

  /**
   * Track an event in Umami analytics
   * @param {string} eventName - Event name (kebab-case)
   * @param {Object} properties - Event properties (optional)
   */
  function trackEvent(eventName, properties) {
    // Only track in production when Umami is loaded
    if (
      typeof window.umami === 'undefined' ||
      typeof window.umami.track !== 'function'
    ) {
      return;
    }

    try {
      const sanitizedProps = sanitizeProperties(properties);
      window.umami.track(eventName, sanitizedProps);
    } catch (error) {
      // Silent fail - don't break user experience if tracking fails
      console.debug('Umami tracking error:', error);
    }
  }

  /**
   * Sanitize event properties to prevent sending sensitive data
   * @param {Object} props - Raw properties
   * @returns {Object} - Sanitized properties
   */
  function sanitizeProperties(props) {
    if (!props || typeof props !== 'object') {
      return {};
    }

    const sanitized = {};
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        let value = props[key];

        // Truncate long strings
        if (typeof value === 'string' && value.length > 100) {
          value = value.substring(0, 100);
        }

        // Only allow primitive types
        if (['string', 'number', 'boolean'].includes(typeof value)) {
          sanitized[key] = value;
        }
      }
    }
    return sanitized;
  }

  // Export to global scope (for pre-ES6 module system)
  window.UmamiTracker = {
    track: trackEvent,
  };
})(window);
