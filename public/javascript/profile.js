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




document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) { // Check if the user is not logged in
        window.location.href = '/login.html';
        return; // Stop further execution
    }
    fetchUserProfile();
    fetchUserEnrolledRaffles();
    setupLogoutButton(); // Setup logout functionality
});


function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token'); // Remove the stored token
        window.location.href = '/login.html'; // Redirect to login page
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchUserEnrolledRaffles(); // Fetch enrolled raffles on page load
});





document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, fetching enrolled raffles...');
    fetchUserEnrolledRaffles(); // Fetch enrolled raffles on page load
});

function fetchUserEnrolledRaffles() {
    console.log('Fetching enrolled raffles from the server...');
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found, redirecting to login');
        window.location.href = '/login.html';
        return;
    }

    fetch('/api/user-raffles', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        console.log('Received response from server...');
        if (!response.ok) {
            throw new Error('Failed to fetch enrolled raffles');
        }
        return response.json();
    })
    .then(raffles => {
        console.log('Raffles fetched:', raffles);
        displayUserEnrolledRaffles(raffles);
    })
    .catch(error => {
        console.error('Error fetching enrolled raffles:', error);
    });
}

function displayUserEnrolledRaffles(raffles) {
    console.log('Displaying raffles...', raffles);
    const rafflesList = document.getElementById('raffles-list');
    rafflesList.innerHTML = '';

    if(raffles.length === 0) {
        console.log('No raffles found for the user.');
        rafflesList.innerHTML = '<p>You are not enrolled in any raffles at the moment.</p>';
        return;
    }

    raffles.forEach(raffle => {
        const raffleEntry = document.createElement('div');
        raffleEntry.className = 'raffle-entry';
        raffleEntry.innerHTML = `
            <h3>${raffle.raffle_name}</h3>
            <p>${raffle.description}</p>
            <p>Ends on: ${new Date(raffle.end_time).toLocaleString()}</p>
        `;
        rafflesList.appendChild(raffleEntry);
    });
}
