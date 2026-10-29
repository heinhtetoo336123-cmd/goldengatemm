// Fallback service worker registration script to avoid SPA fallback HTML errors
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
      console.debug('ServiceWorker registration skipped or failed:', err);
    });
  });
}
