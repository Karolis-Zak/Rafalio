// profile.js
document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
    fetchUserEnrolledRaffles();
    setupLogoutButton();
});

function fetchUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        redirectToLogin();
        return;
    }

    fetch('/api/user-info', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }
        return response.json();
    })
    .then(userData => {
        displayUserProfile(userData);
    })
    .catch(error => {
        console.error('Error fetching user profile:', error);
        alert('Error fetching user profile. Please check the console for more information.');
    });
}

function displayUserProfile(userData) {
    document.getElementById('user-name').textContent = userData.first_name || 'First Name Not Found';
    document.getElementById('user-last-name').textContent = userData.last_name || 'Last Name Not Found';
    document.getElementById('user-email').textContent = userData.email || 'Email Not Found';
}

function fetchUserEnrolledRaffles() {
    const token = localStorage.getItem('token');
    if (!token) {
        redirectToLogin();
        return;
    }

    fetch('/api/user-raffles', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error fetching enrolled raffles');
        }
        return response.json();
    })
    .then(data => {
        displayUserEnrolledRaffles(data);
    })
    .catch(error => {
        console.error('Error fetching enrolled raffles:', error);
    });
}

function displayUserEnrolledRaffles(raffles) {
    const rafflesList = document.getElementById('raffles-list');
    rafflesList.innerHTML = '';

    const now = new Date().getTime();
    raffles.forEach(raffle => {
        const raffleEndTime = new Date(raffle.end_time).getTime();
        if (raffleEndTime > now) { // Only display active raffles
            const listItem = document.createElement('li');
            listItem.textContent = `Raffle Name: ${raffle.raffle_name}, Ends on: ${new Date(raffle.end_time).toLocaleString()}`;
            rafflesList.appendChild(listItem);
        }
    });
}

function setupLogoutButton() {
    const logoutButton = document.getElementById('logout-btn'); // Make sure the ID matches your HTML
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        redirectToLogin();
    });
}

function redirectToLogin() {
    window.location.href = '/login.html'; // Make sure the path is correct
}