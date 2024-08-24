self.addEventListener('install', (event) => {
    console.log('Service worker installato');
    event.waitUntil(
        caches.open('gestione-spese-cache').then((cache) => {
            return cache.addAll([
                '/gestione-spese-2-v2/',
                '/gestione-spese-2-v2/index.html',
                '/gestione-spese-2-v2/add-expense.html',
                '/gestione-spese-2-v2/expenses.html',
                '/gestione-spese-2-v2/style.css',
                '/gestione-spese-2-v2/app.js'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
