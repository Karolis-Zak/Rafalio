document.addEventListener('DOMContentLoaded', function() {
    checkTokenAndLoadRaffles();
    setupCreateRaffleButton();
    setupShowExpiredRafflesButton();
    handleRaffleFormSubmission();
});

function checkTokenAndLoadRaffles() {
    const token = localStorage.getItem('token');
    if (!token) {
        redirectToLogin();
    } else {
        loadRaffles();
    }
}

function redirectToLogin() {
    window.location.href = '/login.html'; // Update with your login page path
}

function loadRaffles() {
    fetch('/api/raffles', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(handleResponse)
    .then(raffles => {
        displayRaffles(raffles);
    })
    .catch(handleNetworkError);
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
    }
    return response.json();
}

function handleNetworkError(error) {
    console.error('Network error:', error);
    alert('A network error occurred. Check the console for more details.');
}

function displayRaffles(raffles) {
    const list = document.getElementById('raffle-list');
    list.innerHTML = ''; // Clear the list before adding new items
    raffles.forEach(raffle => {
        const endTime = new Date(raffle.end_time).getTime();
        if (endTime > Date.now()) {
            // Only display active raffles
            addRaffleToList(raffle);
        }
    });
}

function addRaffleToList(raffle) {
    const list = document.getElementById('raffle-list');
    const article = document.createElement('article');
    article.classList.add('raffle-entry');
    article.innerHTML = `
        <h2>${raffle.raffle_name}</h2>
        <p class="raffle-description">${raffle.description}</p>
        <div id="timer-${raffle.raffle_id}" class="raffle-timer"></div>
        <button class="raffle-enter" data-raffle-id="${raffle.raffle_id}">Enter Raffle</button>
    `;
    list.appendChild(article);
    initializeCountdownTimer(raffle);
    const enterButton = article.querySelector('.raffle-enter');
    enterButton.addEventListener('click', function() {
        enterRaffle(raffle.raffle_id);
    });
}

function initializeCountdownTimer(raffle) {
    const timerElement = document.getElementById(`timer-${raffle.raffle_id}`);
    const endTime = new Date(raffle.end_time).getTime();
    const intervalId = setInterval(function() {
        const now = new Date().getTime();
        const distance = endTime - now;
        if (distance < 0) {
            clearInterval(intervalId);
            timerElement.innerText = 'Expired';
            return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        timerElement.innerText = `Time left: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

function setupCreateRaffleButton() {
    const btn = document.getElementById('create-raffle-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            document.getElementById('create-raffle').classList.toggle('hidden');
        });
    }
}

function setupShowExpiredRafflesButton() {
    const showExpiredBtn = document.getElementById('show-expired-btn');
    if (showExpiredBtn) {
        showExpiredBtn.addEventListener('click', () => {
            const expiredRafflesSection = document.getElementById('expired-raffles');
            expiredRafflesSection.classList.toggle('hidden');
            if (!expiredRafflesSection.classList.contains('hidden')) {
                loadExpiredRaffles();
            }
        });
    }
}

function handleRaffleFormSubmission() {
    const form = document.getElementById('raffle-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const raffleData = {
                raffle_name: formData.get('prize-name'),
                description: formData.get('prize-description'),
                end_time: formData.get('end-time')
            };

            const token = localStorage.getItem('token');
            if (!token) {
                redirectToLogin();
                return;
            }

            fetch('/api/raffles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(raffleData)
            })
            .then(handleResponse)
            .then(() => {
                alert('Raffle created successfully!');
                form.reset();
                loadRaffles(); // Reload the raffles to include the new one
            })
            .catch(handleNetworkError);
        });
    }
}

function loadExpiredRaffles() {
    // Assuming the logic is similar to loadRaffles but filters for expired raffles.
    // Implement the logic to load and display expired raffles here.
    // This may involve a different endpoint or additional parameter to fetch only expired raffles.
}

function enterRaffle(raffleId) {
    const token = localStorage.getItem('token');
    if (!token) {
        redirectToLogin();
        return;
    }

    fetch('/api/enroll-raffle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ raffleId })
    })
    .then(handleResponse)
    .then(() => {
        alert('Enrolled successfully!');
        loadRaffles(); // Update the list to reflect the new status
    })
    .catch(error => {
        alert(`Error enrolling in raffle: ${error.message}`);
        console.error('Error enrolling in raffle:', error);
    });
}

// Ensure this script is robust enough to work with your backend API and the HTML structure.

