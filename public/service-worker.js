//const { response } = require("express");

const APP_PREFIX = "track-my-moolah";
const VERSION = "version_01";

const DATA_CACHE_NAME = "data-cache-v1";
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/js/index.js",
    "/css/styles.css",
    "/js/db.js",
    "/manifest.json",
    "/icons/icon-512x512.png",
    "/icons/icon-384x384.png",
    "/icons/icon-192x192.png",
    "/icons/icon-152x152.png",
    "/icons/icon-144x144.png",
    "/icons/icon-128x128.png",
    "/icons/icon-96x96.png",
    "/icons/icon-72x72.png",
];

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("your files were pre-cached successfully");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function (e) {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("now deleting old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", function (e) {
    if (e.request.url.includes("/api/transaction")) {
    e.respondWith(
        caches
            .open(DATA_CACHE_NAME)
            .then((cache) => {
                console.log('Debug!')
                return fetch(e.request)
                    .then((response) => {
                        if (response.status === 200) {
                        cache.put(e.request.url, response.clone());
                    }

                    return response;
                })
                .catch((err) => {
                    return cache.match(e.request);
                });
            })
            .catch((err) => console.log(err))
        );
        return;
    }

    e.respondWith(
        fetch(e.request).catch(function () {
            return caches.match(e.request).then(function (response) {
                if (response) {
                    return response;
                } else if (e.request.headers.get("accept").includes("text/html")) {
                    return caches.match("/");
                }
            });
        })
    );
});
