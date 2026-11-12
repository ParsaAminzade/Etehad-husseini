/* واترمارک‌زن — سرویس‌ورکر: اجرای کامل آفلاین */
const VERSION = 'wm-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png',
  './fonts/Vazirmatn-Light.woff2',
  './fonts/Vazirmatn-Regular.woff2',
  './fonts/Vazirmatn-Medium.woff2',
  './fonts/Vazirmatn-SemiBold.woff2',
  './fonts/Vazirmatn-Bold.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // ناوبری: اول شبکه، اگر نبود از کش (آفلاین)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(r => { caches.open(VERSION).then(c => c.put('./index.html', r.clone())); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // بقیه: اول کش، در پس‌زمینه تازه‌سازی
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(r => {
        if (r && r.status === 200) caches.open(VERSION).then(c => c.put(req, r.clone()));
        return r;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
