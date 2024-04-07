document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
});

function fetchUserProfile() {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (!token) {
        console.error('No token found, redirecting to login');
        window.location.href = '/login.html';
        return;
    }

    // The endpoint should be the one configured in your server to return the user profile
    fetch('/api/user-info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Correctly passing the token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user profile. Please ensure you are logged in and try again.');
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
    // Adjust the keys according to your actual user data structure
    document.getElementById('user-name').textContent = userData.firstName || 'First Name Not Found';
    document.getElementById('user-last-name').textContent = userData.lastName || 'Last Name Not Found';
    document.getElementById('user-email').textContent = userData.email || 'Email Not Found';
}












function fetchUserEnrolledRaffles() {
    // This function assumes a separate API call is needed to fetch enrolled raffles
    // Adjust the endpoint as necessary
    const token = localStorage.getItem('token');
    fetch('/api/user/enrolled-raffles', {
        method: 'GET',
        credentials: 'include', // For session cookies
        headers: {
            'Authorization': `Bearer ${token}`, // If using tokens
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch enrolled raffles.');
        }
        return response.json();
    })
    .then(raffles => displayUserEnrolledRaffles(raffles))
    .catch(error => {
        console.error('Error fetching enrolled raffles:', error);
        alert('Error fetching enrolled raffles. Please check the console for more information.');
    });
}

function displayUserEnrolledRaffles(raffles) {
    const rafflesList = document.getElementById('raffles-list');
    rafflesList.innerHTML = ''; // Clear existing entries

    raffles.forEach(raffle => {
        const raffleEntry = document.createElement('div');
        raffleEntry.classList.add('raffle-entry');
        
        const raffleName = document.createElement('h3');
        raffleName.textContent = raffle.title; // Adjust based on actual field name
        
        const raffleDescription = document.createElement('p');
        raffleDescription.textContent = raffle.description;
        
        const raffleEndTime = document.createElement('p');
        raffleEndTime.textContent = `Ends on: ${new Date(raffle.endTime).toLocaleString()}`; // Ensure field names match your database schema

        raffleEntry.appendChild(raffleName);
        raffleEntry.appendChild(raffleDescription);
        raffleEntry.appendChild(raffleEndTime);
        
        rafflesList.appendChild(raffleEntry);
    });
}
