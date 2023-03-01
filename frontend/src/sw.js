importScripts('jwt-decode');

const cacheNames = ['static-v1'];
const [ STATIC_CACHE ] = cacheNames;

self.addEventListener('fetch', event => event.respondWith(fetch(event.request)));

self.addEventListener('push', event => { 
    const payload = JSON.parse(event.data.text());

    self.registration.showNotification(payload.title, { body: payload.body, icon: '/assets/icons/app-icon-96x96.png', badge: '/assets/icons/app-icon-96x96.png' });
});