/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Your service worker needs to import dexie and you should declare your db within the service worker itself or in a script that it will import.
// You can also use es6 imports and compile the service worker using webpack but in any case the db instance has to live within the service worker. You can also have another db instance in the DOM that talks to the same DB.
import { syncData } from './database/SyncManager';

clientsClaim();

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
// Add the additional images you want to cache at the beginning of the service worker's lifecycle
precacheAndRoute([
    ...self.__WB_MANIFEST,
    { url: '/src/assets/images/pic_walk_with_another.png', revision: '1' },
    { url: '/src/assets/images/pic_danger_2.png', revision: '1' },
    { url: '/src/assets/images/pic_no_faces.png', revision: '1' },
    { url: '/src/assets/images/pic_ask_help.png', revision: '1' },
    { url: '/src/assets/images/icon_smilies.png', revision: '1' },
]);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== 'navigate') {
      return false;
    } // If this is a URL that starts with /_, skip.

    if (url.pathname.startsWith('/_')) {
      return false;
    } // If this looks like a URL for a resource, because it contains // a file extension, skip.

    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    } // Return true to signal that we want to use the handler.

    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// An example runtime caching route for requests that aren't handled by the
// precache, in this case same-origin .png requests like those from in public/
registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'), // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      // Ensure that once this runtime cache reaches a maximum size the
      // least-recently used images are removed.
      new ExpirationPlugin({ maxEntries: 100 }),
    ],
  })
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Any other custom service worker logic can go here.
self.addEventListener('activate', event => {
    // code to fire after activation
});

//starts the indexdb > firestore sync as soon as SW is registered.
console.log("sw registered so kick off syncData interval 60000");
syncData();

//how to use syncManager ? is syncManager appropriate for what im trying to do?
function testNetworkConnectivityAndSync(tag) {
    fetch('/', { method: 'HEAD' })
        .then(function(response) {
            if (response.ok) {
                console.log('Network connectivity test succeeded. Attempting background sync...');
                self.registration.sync.register(tag);
            } else {
                console.log('Network connectivity test failed. Background sync cancelled.');
            }
        })
        .catch(function(error) {
            console.log('Network connectivity test failed with error:', error);
        });
}

