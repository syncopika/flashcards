// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching

// service worker to help with caching JSON data used for the flashcards
// we'll be using a "network first" strategy (try fetching from network the latest data first. if that fails, fall back to cache.)
const cacheName = "flashcards_cache";

async function networkFirst(request){
  try {
    console.log("got fetch request");
    // get the latest data via fetch
    const networkResponse = await fetch(request);
    if(networkResponse.ok){
      console.log("got data, adding to cache");
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }catch(err){
    // if fetch failed, possibly no internet? so try the cache for the data
    const cachedResponse = await caches.match(request);
    return cachedResponse || Response.error();
  }
}

// intercept fetch events so we can use our 'network first' strategy
self.addEventListener("fetch", (evt) => {
  const url = new URL(evt.request.url);
  //if(url.pathname.match(/datasets\/.+.json/)){
  evt.respondWith(networkFirst(evt.request));
  //}
});


async function precache(){
  const precachedResources = [
    "/",
    "hanzi_lookup_worker.js",
    "hanzi_lookup.js",
    "hanzi_lookup_bg.wasm",
    //".js", 
    //"index-eafba863.css"
  ];
  console.log("precaching resources");
  const cache = await caches.open(cacheName);
  return cache.addAll(precachedResources);
}

// make sure to cache all the needed static files in the service worker's install event
self.addEventListener("install", (evt) => {
  evt.waitUntil(precache());
});
