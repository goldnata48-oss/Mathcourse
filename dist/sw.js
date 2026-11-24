/* 2026 Наталия Кравченко. Все права защищены. Образовательный курс — «Маткурс» */
const CACHE_NAME = "mathcourse-1d4f4c6a";
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
  "./kvantik-math.js",
  "./app.js",
  "./chimeralab.jpg",
  "./assets/nmt-reference-ua.pdf",
  "./assets/nmt-reference-ru.pdf",
  "./assets/chimera-cover.jpg",
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

// Prefer deployed files online; retain the complete course for offline use.
self.addEventListener("fetch", event => {
  if(event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(event.request, {cache: "no-cache"});
      if(response.ok){
        await cache.put(event.request, response.clone());
        return response;
      }
      return (await cache.match(event.request)) || response;
    } catch(error) {
      const cached = await cache.match(event.request);
      if(cached) return cached;
      if(event.request.mode === "navigate") return cache.match("./index.html");
      return Response.error();
    }
  })());
});
