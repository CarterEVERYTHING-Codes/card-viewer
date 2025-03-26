document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const cardId = params.get("cardId");
    
    if (!cardId) {
        alert("No card ID provided!");
        return;
    }

    // Loading screen
    document.getElementById('loadingScreen').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';

    fetch(`https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec?cardId=${cardId}`)
        .then(response => response.json())
        .then(data => {
            if (!data || !data.cards) {
                throw new Error("Invalid data received");
            }

            let card = data.cards.find(c => c['Card Number:'] === cardId);
            if (!card) {
                throw new Error("Card not found!");
            }

            document.getElementById('userName').textContent = card['Name on card:'];
            document.getElementById('balance').textContent = `${card['Card Balance:']} DigiCredits`;
            document.getElementById('cardNumber').textContent = card['Card Number:'];
            document.getElementById('expiry').textContent = card['Expires:'];
            document.getElementById('cvc').textContent = card['CVC:'];

            // Platinum Features
            if (card['Type:'].trim().toLowerCase() === 'platinum') {
                document.getElementById('platinumFeatures').style.display = 'block';

                let cashback = card['Cashback'] || 'N/A';
                let creditScore = card['Credit Score'] || 'N/A';
                let maxDebt = parseFloat(card['Max Credit Debt'] || 0);
                let debt = parseFloat(card['Debt Due'] || 0);
                let debtDueDate = card['Debt Due Date'] || 'N/A';

                let debtWarning = debt >= maxDebt * 0.8 ? `<span class="warning">⚠️ Warning: High Debt!</span>` : '';

                document.getElementById('cashback').textContent = `Cashback: ${cashback}`;
                document.getElementById('creditScore').textContent = `Credit Score: ${creditScore}`;
                document.getElementById('debtInfo').innerHTML = `Debt Due: ${debt} / ${maxDebt} DigiCredits ${debtWarning}`;
                document.getElementById('debtDueDate').textContent = `Debt Due Date: ${debtDueDate}`;

                let previousCreditScore = localStorage.getItem('creditScore');
                if (previousCreditScore && creditScore > previousCreditScore) {
                    celebrate();
                }

                localStorage.setItem('creditScore', creditScore);
                localStorage.setItem('creditLimit', maxDebt);
            }

            // Recent Transactions
            if (card['Recent Transactions']) {
                let transactions = card['Recent Transactions'].split(',');
                let transactionList = transactions.map(t => `<li>${t}</li>`).join('');
                document.getElementById('recentTransactions').innerHTML = `<ul>${transactionList}</ul>`;
            } else {
                document.getElementById('recentTransactions').innerHTML = "<p>No recent transactions found.</p>";
            }

            // Hide loading screen and show dashboard
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
        })
        .catch(error => {
            console.error("Error fetching card data:", error);
            document.getElementById('loadingScreen').textContent = "Error loading card data.";
        });
});
