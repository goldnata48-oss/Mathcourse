/* 2026 Наталия Кравченко. Все права защищены. Образовательный курс — «Маткурс» */
const CACHE_NAME = "mathcourse-1b6f497b";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./theme.css",
  "./styles.css",
  "./i18n.js",
  "./lessons.js",
  "./lesson-data.js",
  "./kid-widgets.js",
  "./trainer.js",
  "./app.js",
  "./chimeralab.jpg",
  "./privacy.html"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
