const CACHE_NAME = "my-pwa-v1";
const urlsToCach = [
    "/",
    "/index.html",
    "style.css",
    "main.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log("✅ کش باز شد");
                cache.addAll(urlsToCach)
            })
            .catch((err) => console.log("❌ خطا در کش:", err))
    )
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    )
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName != CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            )
        })
    )
})