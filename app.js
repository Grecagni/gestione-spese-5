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
});

function toggleAuthUI(user) {
    const loginContainer = document.getElementById('login-container');
    const contentContainer = document.getElementById('content-container');
    const navbar = document.getElementById('navbar');
    
    if (loginContainer) {
        loginContainer.style.display = user ? 'none' : 'block';
    }
    if (contentContainer) {
        contentContainer.style.display = user ? 'block' : 'none';
    }
    if (navbar) {
        navbar.style.display = user ? 'block' : 'none';
    }
}

function displayHomeContent() {
    const recentExpensesList = document.getElementById('recentExpenses');
    const totalBalanceDiv = document.getElementById('totalBalance');
    const balanceBarFill = document.getElementById('balanceBarFill');

    db.collection("expenses").orderBy("date", "desc").limit(5).get().then((querySnapshot) => {
        let totalJackMesso = 0; // Quanto Jack ha messo
        let totalSteMesso = 0; // Quanto Stefania ha messo
        let totalJackDovuto = 0; // Quanto Jack doveva mettere
        let totalSteDovuto = 0; // Quanto Stefania doveva mettere

        if (recentExpensesList) {
            recentExpensesList.innerHTML = '';
        }

        querySnapshot.forEach((doc) => {
            const expense = doc.data();
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = `${formatDate(expense.date)} - ${expense.description}: €${parseFloat(expense.totalAmount).toFixed(2)}`;
            if (recentExpensesList) {
                recentExpensesList.appendChild(listItem);
            }

            totalJackMesso += parseFloat(expense.jackAmount);
            totalSteMesso += parseFloat(expense.steAmount);
            totalJackDovuto += parseFloat(expense.jackShare);
            totalSteDovuto += parseFloat(expense.steShare);
        });

        // Calcolo del saldo per Jack e Stefania
        const saldoJack = totalJackMesso - totalJackDovuto;
        const saldoSte = totalSteMesso - totalSteDovuto;
        const totaleSaldo = saldoJack - saldoSte;

        let balanceText = '';

        if (totaleSaldo > 0) {
            balanceText = `Stefania deve dare a Jack: €${totaleSaldo.toFixed(2)}`;
        } else if (totaleSaldo < 0) {
            balanceText = `Jack deve dare a Stefania: €${Math.abs(totaleSaldo).toFixed(2)}`;
        } else {
            balanceText = `Jack e Stefania sono pari.`;
        }

        if (totalBalanceDiv) {
            totalBalanceDiv.textContent = balanceText;
        }

        // Aggiorna la barra di stato
        const maxBalance = Math.max(totalJackMesso, totalSteMesso);
        const percent = (totaleSaldo + maxBalance) / (2 * maxBalance) * 100;
        balanceBarFill.style.width = percent + '%';
        balanceBarFill.style.backgroundColor = totaleSaldo === 0 ? '#28a745' : (totaleSaldo > 0 ? '#007bff' : '#dc3545');
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', options);
}
