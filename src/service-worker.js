/* eslint-disable no-restricted-globals */

// Radha Dham PWA service worker — offline support ke liye
// Build ke waqt CRA (Workbox InjectManifest) precache list yahan daal deta hai.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Naya version aate hi turant activate ho jaye (purana cache jaldi hate)
self.skipWaiting();
clientsClaim();

// Build ke saare JS/CSS/HTML files pehle se cache ho jaate hain
precacheAndRoute(self.__WB_MANIFEST);

// App-shell routing: sab navigation requests index.html pe jaayen (SPA)
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(({ request, url }) => {
  if (request.mode !== 'navigate') return false;
  if (url.pathname.startsWith('/_')) return false;
  if (url.pathname.match(fileExtensionRegexp)) return false;
  return true;
}, createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html'));

// Gallery/darshan photos — ek baar dekhne ke baad offline bhi dikhengi
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    /\.(png|jpg|jpeg|webp|ico)$/.test(url.pathname),
  new CacheFirst({
    cacheName: 'radha-dham-images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// Baaki same-origin requests (manifest wagera)
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.json'),
  new StaleWhileRevalidate({ cacheName: 'radha-dham-misc' })
);

// Naya version aane par turant activate ho jaye
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
