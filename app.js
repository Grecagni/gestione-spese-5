document.addEventListener('DOMContentLoaded', function() {
    console.log(firebase.apps.length ? "Firebase è stato inizializzato" : "Firebase NON è stato inizializzato");

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/gestione-spese-2-v2/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registrato con successo:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }

    firebase.auth().onAuthStateChanged((user) => {
        toggleAuthUI(user);
        if (user && window.location.pathname.includes("index.html")) {
            displayHomeContent();
        } else if (user && window.location.pathname.includes("expenses.html")) {
            displayExpenses();
        }
    });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            firebase.auth().signInWithEmailAndPassword(
                document.getElementById('loginEmail').value,
                document.getElementById('loginPassword').value
            ).then((userCredential) => {
                console.log("Login avvenuto con successo:", userCredential.user);
            }).catch((error) => {
                console.error("Errore durante il login:", error);
                alert("Credenziali non valide. Riprova.");
            });
        });
    }

    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const expenseData = {
                description: document.getElementById('description').value,
                date: document.getElementById('date').value,
                totalAmount: parseFloat(document.getElementById('totalAmount').value),
                jackAmount: parseFloat(document.getElementById('jackAmount').value),
                steAmount: parseFloat(document.getElementById('steAmount').value),
                jackShare: parseFloat(document.getElementById('jackShare').value) || (parseFloat(document.getElementById('totalAmount').value) / 2),
                steShare: parseFloat(document.getElementById('steShare').value) || (parseFloat(document.getElementById('totalAmount').value) / 2),
            };

            if ((expenseData.jackAmount + expenseData.steAmount) !== expenseData.totalAmount) {
                alert('La somma degli importi messi da Jack e Ste non corrisponde al totale della spesa.');
                return;
            }

            db.collection("expenses").add(expenseData)
                .then(() => {
                    console.log("Spesa aggiunta con successo!");
                    window.location.href = '/gestione-spese-2-v2/expenses.html';
                })
                .catch((error) => {
                    console.error("Errore durante l'aggiunta della spesa:", error);
                });
        });
    }
});

function toggleAuthUI(user) {
    const isLoggedIn = !!user;
    document.getElementById('login-container').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('content-container').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('navbar').style.display = isLoggedIn ? 'block' : 'none';
}
