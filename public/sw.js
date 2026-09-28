// Zencus no longer uses a service worker. Older versions of the site installed
// one (focus-shell-v7) that cached the app; browsers keep checking this path
// for updates, so this retires it: clear its caches, unregister, and reload
// any open tabs so they load the current app straight from the network.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const tabs = await self.clients.matchAll({ type: 'window' });
      tabs.forEach((tab) => tab.navigate(tab.url));
    })()
  );
});
