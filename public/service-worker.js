const APP_PREFIX = 'Track-my-moolah';
const VERSION = 'version_01';

const DATA_CACHE_NAME = "data-cache-v1";
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    ".js/index.js",
    "./css/styles.css",
    ".js/db.js",
    "./manifest.json",
    "./icons/icon-512x512.png",
    "./icons/icon-384x384.png",
    "./icons/icon-192x192.png",
    "./icons/icon-152x152.png",
    "./icons/icon-144x144.png",
    "./icons/icon-128x128.png",
    "./icons/icon-96x96.png",
    "./icons/icon-72x72.png",
];


self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('now installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE)
        })
    )
    self.skipWaiting();
})

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeepList = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(keyList.map(function (key, i){
                if (cacheKeepList.indexOf(key) === -1) {
                    console.log('now deleting cache : ' + keyList[i]);
                    return caches.delete(keyList[i]);
                }
            }));
        })
    )
});

self.addEventListener('fetch', function(e) {
    console.log('fetch request : ' + e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) { // if cache is available, respond with cache
            console.log('now responding with cache : ' + e.request.url);
            return request
            } else { //if there is no cache, try fetching request
                console.log('no cache found, now fetching : ' + e.request.url);
            }
        })
    )
});