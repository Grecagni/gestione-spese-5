self.addEventListener('install', (event) => {
    console.log('Service worker installato');
    event.waitUntil(
        caches.open('gestione-spese-cache').then((cache) => {
            return cache.addAll([
                '/gestione-spese-5/',
                '/gestione-spese-5/index.html',
                '/gestione-spese-5/add-expense.html',
                '/gestione-spese-5/expenses.html',
                '/gestione-spese-5/style.css',
                '/gestione-spese-5/app.js'
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
