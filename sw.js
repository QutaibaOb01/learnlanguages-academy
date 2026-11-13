/* Learn Languages Academy service worker — 20261113-6058c9aa */
const CACHE = 'lla-20261113-6058c9aa';
const CORE = ['./', './index.html', './config.js', './icon.svg', './icon-192.png', './icon-512.png', './manifest.webmanifest', './vendor/firebase-app-compat.js', './vendor/firebase-auth-compat.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const put = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    // network first, so updates arrive; cached copy when offline
    e.respondWith(fetch(req).then(res => put('./index.html', res)).catch(() => caches.match('./index.html')));
    return;
  }
  if (url.origin === location.origin && url.pathname.endsWith('/config.js')) {
    // the keys file is edited by hand: always try the network first
    e.respondWith(fetch(req).then(res => put(req, res)).catch(() => caches.match(req)));
    return;
  }
  if (url.origin === location.origin || /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(res => put(req, res)).catch(() => hit);
      return hit || net;
    }));
  }
});
