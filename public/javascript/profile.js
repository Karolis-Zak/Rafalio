function fetchUserProfile() {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (!token) {
        console.error('No token found, redirecting to login');
        window.location.href = '/login.html';
        return;
    }

    fetch('/api/user-info', {
        method: 'GET',
        credentials: 'include', // If your API requires cookies; otherwise, this can be omitted
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => response.json())
    .then(userData => {
        displayUserProfile(userData);
        // Assuming your API returns user's enrolled raffles within userData
        if (userData.enrolledRaffles) {
            displayUserEnrolledRaffles(userData.enrolledRaffles);
        } else {
            // If enrolled raffles are not part of the user data, fetch them separately
            fetchUserEnrolledRaffles();
        }
    })
    .catch(error => console.error('Error fetching user profile:', error));
}

function displayUserProfile(userData) {
    document.getElementById('user-name').textContent = `${userData.first_name} ${userData.last_name}`;
    document.getElementById('user-email').textContent = userData.email;
    
}

function fetchUserEnrolledRaffles() {
    // This function assumes a separate API call is needed to fetch enrolled raffles
    // Adjust the endpoint as necessary
    fetch('/api/user/enrolled-raffles', {
        method: 'GET',
        credentials: 'include', // For session cookies
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // If using tokens
        }
    })
    .then(response => response.json())
    .then(raffles => displayUserEnrolledRaffles(raffles))
    .catch(error => console.error('Error fetching enrolled raffles:', error));
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
