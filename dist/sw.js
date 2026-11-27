/* 2026 Наталия Кравченко. Все права защищены. Образовательный курс — «Маткурс» */
const CACHE_NAME = "mathcourse-f12a68cd";
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
  "./assets/nmt-2024/question-03.png",
  "./assets/nmt-2024/question-05.png",
  "./assets/nmt-2024/question-07.png",
  "./assets/nmt-2024/question-14.png",
  "./assets/nmt-2024/question-18.png",
  "./assets/nmt-2024/question-19.png",
  "./assets/nmt-2025/question-01.png",
  "./assets/nmt-2025/question-02.png",
  "./assets/nmt-2025/question-05.png",
  "./assets/nmt-2025/question-08.png",
  "./assets/nmt-2025/question-15.png",
  "./assets/nmt-2025/question-18.png",
  "./assets/nmt-2025/question-20.png",
  "./assets/nmt-2026/question-01.png",
  "./assets/nmt-2026/question-02.png",
  "./assets/nmt-2026/question-06.png",
  "./assets/nmt-2026/question-10.png",
  "./assets/nmt-2026/question-12.png",
  "./assets/nmt-2026/question-15.png",
  "./assets/nmt-2026/question-18.png",
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
  const requestUrl = new URL(event.request.url);
  if(event.request.method !== "GET" || requestUrl.origin !== self.location.origin || requestUrl.pathname.toLowerCase().endsWith(".pdf")) return;
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
