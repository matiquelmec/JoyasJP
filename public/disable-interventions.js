// Disable Chrome/Edge lazy loading interventions
// This runs IMMEDIATELY before any other script

// Force all images to load immediately
if (typeof window !== 'undefined') {
  // Override the loading attribute for all images
  Object.defineProperty(HTMLImageElement.prototype, 'loading', {
    get: function() { return 'eager'; },
    set: function() { return 'eager'; }
  });

  // Disable Chrome's lazy loading by setting a flag
  if ('chrome' in window) {
    // Signal to Chrome that we handle our own lazy loading
    window.__disable_lazy_loading__ = true;
  }

  // Force all images to start loading immediately
  document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Force eager loading
      img.loading = 'eager';
      // If src is set, trigger load
      if (img.src && !img.complete) {
        img.src = img.src;
      }
    });
  });

  // Intercept any new images added to DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.tagName === 'IMG') {
          node.loading = 'eager';
        }
      });
    });
  });

  // Start observing
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
}