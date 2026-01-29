(function () {
  'use strict';

  function registerServiceWorker() {
    try {
      if (!('serviceWorker' in navigator)) return;

      navigator.serviceWorker
        .register('./sw.js', { scope: './' })
        .then(function (registration) {
          // Best-effort update check.
          try {
            registration.update();
          } catch (e) {
            // ignore
          }
        })
        .catch(function () {
          // ignore
        });
    } catch (e) {
      // ignore
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
  } else {
    registerServiceWorker();
  }
})();
