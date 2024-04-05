document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Collect login form data
    const loginData = {
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value,
    };

    // Sending the login data to the server
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Wrong login details, please try again.');
        }
        return response.json();
    })
    .then(data => {
        // Save token to localStorage and redirect to profile page
        localStorage.setItem('token', data.token);
        window.location.href = data.redirect; // Use the redirect path from the server response
    })
    .catch(error => {
        // Display error message to the user
        document.getElementById('login-error-message').textContent = error.message;
        document.getElementById('login-error-message').style.display = 'block';
    });
});
