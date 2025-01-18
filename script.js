document.getElementById('cardForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const cardColor = document.getElementById('cardColor').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const cardName = document.getElementById('cardName').value;
    const cardType = document.getElementById('cardType').value;
    const cardRarity = document.getElementById('cardRarity').value;
    const alternateArt = document.getElementById('alternateArt').checked ? 'Yes' : 'No';

    const tableBody = document.getElementById('cardTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `<td>${cardColor}</td><td>${cardNumber}</td><td>${cardName}</td><td>${cardType}</td><td>${cardRarity}</td><td>${alternateArt}</td><td><button class="add-to-deck-btn">Add to Deck</button> <button class="remove-card-btn">Remove</button></td>`;
    tableBody.appendChild(newRow);

    // Save the table data to localStorage
    saveTableData();

    // Clear the form
    document.getElementById('cardForm').reset();
});

document.getElementById('deckForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const deckName = document.getElementById('deckName').value;
    const deckLeader = document.getElementById('deckLeader').value;
    const deckColor = document.getElementById('deckColor').value;

    const tableBody = document.getElementById('deckTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `<td><b>${deckName}</b></td><td><b>${deckLeader}</b></td><td><b>${deckColor}</b></td><td><span class="card-counter">0</span> cards</td><td><button class="remove-deck-btn">Remove</button></td>`;
    tableBody.appendChild(newRow);

    // Save the deck data to localStorage
    saveDeckData();

    // Clear the form
    document.getElementById('deckForm').reset();
});

function saveTableData() {
    const tableBody = document.getElementById('cardTableBody');
    const rows = Array.from(tableBody.rows);
    const data = rows.map(row => {
        return {
            cardColor: row.cells[0].innerText,
            cardNumber: row.cells[1].innerText,
            cardName: row.cells[2].innerText,
            cardType: row.cells[3].innerText,
            cardRarity: row.cells[4].innerText,
            alternateArt: row.cells[5].innerText
        };
    });
    localStorage.setItem('cardTableData', JSON.stringify(data));
}

function saveDeckData() {
    const tableBody = document.getElementById('deckTableBody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const data = [];
    let currentDeck = null;

    rows.forEach(row => {
        if (row.querySelector('.card-counter')) {
            if (currentDeck) {
                data.push(currentDeck);
            }
            currentDeck = {
                deckName: row.cells[0].innerText,
                deckLeader: row.cells[1].innerText,
                deckColor: row.cells[2].innerText,
                cardCount: parseInt(row.querySelector('.card-counter').innerText),
                cards: []
            };
        } else if (currentDeck && !row.querySelector('.remove-deck-btn')) {
            currentDeck.cards.push({
                cardNumber: row.cells[0].innerText,
                cardName: row.cells[1].innerText,
                cardType: row.cells[2].innerText
            });
        }
    });

    if (currentDeck) {
        data.push(currentDeck);
    }

    localStorage.setItem('deckTableData', JSON.stringify(data));
}

function loadTableData() {
    const data = JSON.parse(localStorage.getItem('cardTableData'));
    if (data) {
        data.sort((a, b) => {
            const aParts = a.cardNumber.match(/(OP\d+)-(\d+)/);
            const bParts = b.cardNumber.match(/(OP\d+)-(\d+)/);

            if (a.cardType === 'Leader' && b.cardType !== 'Leader') return -1;
            if (a.cardType !== 'Leader' && b.cardType === 'Leader') return 1;

            if (aParts[1] < bParts[1]) return -1;
            if (aParts[1] > bParts[1]) return 1;

            if (a.cardColor < b.cardColor) return -1;
            if (a.cardColor > b.cardColor) return 1;

            return parseInt(aParts[2]) - parseInt(bParts[2]);
        });

        const tableBody = document.getElementById('cardTableBody');
        tableBody.innerHTML = ''; // Clear existing rows
        data.forEach(item => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `<td>${item.cardColor}</td><td>${item.cardNumber}</td><td>${item.cardName}</td><td>${item.cardType}</td><td>${item.cardRarity}</td><td>${item.alternateArt}</td><td><button class="add-to-deck-btn">Add to Deck</button> <button class="remove-card-btn">Remove</button></td>`;
            tableBody.appendChild(newRow);
        });
    }
}

function loadDeckData() {
    const data = JSON.parse(localStorage.getItem('deckTableData'));
    if (data) {
        const tableBody = document.getElementById('deckTableBody');
        tableBody.innerHTML = ''; // Clear existing rows
        data.forEach(item => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `<td><b>${item.deckName}</b></td><td><b>${item.deckLeader}</b></td><td><b>${item.deckColor}</b></td><td><span class="card-counter">${item.cardCount}</span> cards</td><td><button class="remove-deck-btn">Remove</button></td>`;
            tableBody.appendChild(newRow);

            item.cards.forEach(card => {
                const cardRow = document.createElement('tr');
                cardRow.classList.add('card-row');
                cardRow.innerHTML = `<td>${card.cardNumber}</td><td>${card.cardName}</td><td>${card.cardType}</td><td><button class="remove-card-btn">Remove</button></td>`;
                newRow.insertAdjacentElement('afterend', cardRow);
            });
        });
    }
}

// Load table data when the page loads
window.addEventListener('load', () => {
    loadTableData();
    loadDeckData();
});

// Add event listener for add-to-deck buttons
document.getElementById('cardTableBody').addEventListener('click', function(event) {
    if (event.target.classList.contains('add-to-deck-btn')) {
        const row = event.target.closest('tr');
        const cardNumber = row.cells[1].innerText;
        const cardName = row.cells[2].innerText;
        const cardType = row.cells[3].innerText;

        const deckTableBody = document.getElementById('deckTableBody');
        const selectedDeckRow = deckTableBody.querySelector('tr.selected');
        if (selectedDeckRow) {
            const newRow = document.createElement('tr');
            newRow.classList.add('card-row');
            newRow.innerHTML = `<td>${cardNumber}</td><td>${cardName}</td><td>${cardType}</td><td><button class="remove-card-btn">Remove</button></td>`;
            selectedDeckRow.insertAdjacentElement('afterend', newRow);

            // Update card counter
            const cardCounter = selectedDeckRow.querySelector('.card-counter');
            cardCounter.innerText = parseInt(cardCounter.innerText) + 1;

            // Save the deck data to localStorage
            saveDeckData();
        } else {
            alert('Please select a deck to add the card to.');
        }
    }
});

// Add event listener for remove buttons
document.getElementById('deckTableBody').addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-deck-btn')) {
        if (confirm('Are you sure you want to delete this deck and all its cards?')) {
            const row = event.target.closest('tr');
            let nextRow = row.nextElementSibling;

            // Remove all associated card rows and header row
            while (nextRow && !nextRow.querySelector('.card-counter')) {
                const tempRow = nextRow;
                nextRow = nextRow.nextElementSibling;
                tempRow.remove();
            }

            // Remove the deck row itself
            row.remove();

            // Save the updated deck data to localStorage
            saveDeckData();
        }
    } else if (event.target.classList.contains('remove-card-btn')) {
        const row = event.target.closest('tr');
        const deckRow = row.previousElementSibling;
        row.remove();

        // Update card counter
        const cardCounter = deckRow.querySelector('.card-counter');
        cardCounter.innerText = parseInt(cardCounter.innerText) - 1;

        saveDeckData();
    } else {
        // Select the deck row
        const rows = document.querySelectorAll('#deckTableBody tr');
        rows.forEach(r => r.classList.remove('selected'));
        event.target.closest('tr').classList.add('selected');
    }
});

// Add event listener for remove buttons in card list
document.getElementById('cardTableBody').addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-card-btn')) {
        const row = event.target.closest('tr');
        row.remove();

        // Save the updated card data to localStorage
        saveTableData();
    }
});
