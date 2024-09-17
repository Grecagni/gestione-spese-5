
    document.addEventListener('DOMContentLoaded', function() {
        if (!firebase.apps.length) {
            console.error('Firebase NON è stato inizializzato. Verifica la configurazione e il caricamento degli script.');
        } else {
            console.log('Firebase è stato inizializzato correttamente.');
        }

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/gestione-spese-5/service-worker.js')
                    .then(registration => {
                        console.log('Service Worker registrato con successo:', registration);
                    })
                    .catch(error => {
                        console.log('Service Worker registration failed:', error);
                    });
            });
        }
    });
    