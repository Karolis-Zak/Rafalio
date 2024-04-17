document.addEventListener('DOMContentLoaded', function() {
    fetchExpiredRaffles();
});

function fetchExpiredRaffles() {
    fetch('/api/expired-raffles', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token') // Ensure you use the correct method to include the token
        }
    })
    .then(response => response.json())
    .then(raffles => {
        displayExpiredRaffles(raffles);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error loading expired raffles. Please try again later.');
    });
}

function displayExpiredRaffles(raffles) {
    const container = document.getElementById('expired-raffles-container');
    container.innerHTML = ''; // Clear previous entries

    raffles.forEach(raffle => {
        const raffleElement = document.createElement('div');
        raffleElement.className = 'raffle';
        raffleElement.innerHTML = `
            <h3>${raffle.raffle_name}</h3>
            <p>Description: ${raffle.description}</p>
            <p>Ended on: ${new Date(raffle.end_time).toLocaleString()}</p>
            <button onclick="selectWinner('${raffle.raffle_id}', this)">Show Winner</button>
            <div id="winner-${raffle.raffle_id}" class="winner-info"></div>
        `;
        container.appendChild(raffleElement);
    });
}

function selectWinner(raffleId, button) {
    button.disabled = true; // Disable the button after it's clicked

    fetch(`/api/select-winner/${raffleId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token') // Ensure you use the correct method to include the token
        }
    })
    .then(response => response.json())
    .then(winner => {
        if (winner) {
            const winnerInfo = document.getElementById(`winner-${raffleId}`);
            winnerInfo.textContent = `Winner: ${winner.name}`; // Make sure your backend sends `name` in the response
        } else {
            button.disabled = false; // Re-enable button if no winner is selected
            alert('No winner could be selected.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        button.disabled = false; // Re-enable button in case of error
        alert('Error selecting a winner. Please try again.');
    });
}
