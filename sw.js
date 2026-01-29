/* Minimal service worker for offline-first shell caching.
  Safe default: navigation fallback + runtime caching (including CDN assets).
  Note: CDN assets will be available offline after the first successful load.
*/

const CACHE_NAME = 'ms-constructora-shell-v3';
const RUNTIME_CACHE = 'ms-constructora-runtime-v1';

const CDN_HOSTS = new Set([
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com'
]);

const SHELL_ASSETS = [
  './',
  './index.html',
  './inicio.html',
  './dashboard.html',
  './proyectos.html',
  './presupuestos.html',
  './compras.html',
  './seguimiento.html',
  './rrhh.html',
  './rendimiento.html',
  './admin-invites.html',
  './limpiar-datos.html',
  './theme-preview.html',
  './worker.html',
  './manifest.json',
  './styles.css',
  './executive-theme.css',
  './app.js',
  './pwa.js',
  './database.js',
  './sync.js',
  './renglones-presupuestos.js',
  './supabase.public.js',
  './worker.js',
  './jsPDF.min.js',
  './jspdf.plugin.autotable.min.js',
  './sw.js',
  './favicon.ico',
  './logo.png',
  './header-logo.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key === CACHE_NAME ? Promise.resolve() : caches.delete(key))))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCdn = CDN_HOSTS.has(url.hostname);
  const isNavigation = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (!(isSameOrigin || isCdn || isNavigation)) return;

  // Navigations: network-first, fallback to cached page (or index.html).
  if (isNavigation) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // CDN/static assets: cache-first with background refresh.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          const resClone = res.clone();
          const targetCache = isCdn ? RUNTIME_CACHE : CACHE_NAME;
          caches.open(targetCache).then((cache) => cache.put(req, resClone)).catch(() => undefined);
          return res;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// Notificaciones (click → enfocar tab o abrir portal)
self.addEventListener('notificationclick', (event) => {
  const data = event.notification?.data || {};
  const url = (data && typeof data.url === 'string' && data.url) ? data.url : './worker.html';
  event.notification?.close();

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.pathname.endsWith('/worker.html') || clientUrl.pathname.endsWith('/rrhh.html')) {
            await client.focus();
            return;
          }
        } catch {
          // ignore
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});
