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
        const saldo = totalJackMesso - totalJackDovuto;

        let balanceText = '';

        if (saldo > 0) {
            balanceText = `Stefania deve dare a Jack: €${saldo.toFixed(2)}`;
        } else if (saldo < 0) {
            balanceText = `Jack deve dare a Stefania: €${Math.abs(saldo).toFixed(2)}`;
        } else {
            balanceText = `Jack e Stefania sono pari.`;
        }

        if (totalBalanceDiv) {
            totalBalanceDiv.textContent = balanceText;
        }

        // Aggiorna la barra di stato
        const maxBalance = Math.max(Math.abs(totalJackMesso), Math.abs(totalJackDovuto));
        const percent = (saldo + maxBalance) / (2 * maxBalance) * 100;
        balanceBarFill.style.width = percent + '%';
        balanceBarFill.style.backgroundColor = saldo === 0 ? '#28a745' : (saldo > 0 ? '#007bff' : '#dc3545');
    });
}

function displayExpenses() {
    const expenseList = document.getElementById('expenseList');
    
    db.collection("expenses").orderBy("date", "desc").onSnapshot((querySnapshot) => {
        console.log("Documenti recuperati:", querySnapshot.docs.length);

        if (expenseList) {
            expenseList.innerHTML = '';
        }

        querySnapshot.forEach((doc) => {
            const expense = doc.data();
            console.log(expense);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(expense.date)}</td>
                <td>${expense.description}</td>
                <td>€${parseFloat(expense.totalAmount).toFixed(2)}</td>
                <td>€${parseFloat(expense.jackAmount).toFixed(2)}</td>
                <td>€${parseFloat(expense.steAmount).toFixed(2)}</td>
                <td>€${parseFloat(expense.jackShare).toFixed(2)}</td>
                <td>€${parseFloat(expense.steShare).toFixed(2)}</td>
                <td><button class="btn btn-danger" onclick="confirmDeleteExpense('${doc.id}')">X</button></td>
            `;
            if (expenseList) {
                expenseList.appendChild(row);
            }
        });
    });
}

function confirmDeleteExpense(id) {
    if (confirm("Sei sicuro di voler eliminare questa spesa?")) {
        deleteExpense(id);
    }
}

function deleteExpense(id) {
    db.collection("expenses").doc(id).delete()
        .then(() => {
            displayExpenses();
        })
        .catch((error) => {
            console.error("Errore nell'eliminare la spesa: ", error);
        });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', options);
}
