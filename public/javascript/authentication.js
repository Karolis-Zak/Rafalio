document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const loginToggle = document.getElementById('login-toggle');
    const registerToggle = document.getElementById('register-toggle');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const passwordInput = document.getElementById('password');
    const passwordStrengthText = document.getElementById('password-strength');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordMatchText = document.getElementById('password-match');

    // Function to toggle form visibility
    function toggleForm(form) {
        if (form.classList.contains('form-hidden')) {
            form.classList.remove('form-hidden');
            form.classList.add('form-active');
        } else {
            form.classList.add('form-hidden');
            form.classList.remove('form-active');
        }
    }

    // Add click event listeners to toggle buttons if they exist
    if (loginToggle && registerToggle && loginForm && registerForm) {
        loginToggle.addEventListener('click', () => {
            toggleForm(loginForm);
            registerForm.classList.add('form-hidden');
            registerForm.classList.remove('form-active');
        });

        registerToggle.addEventListener('click', () => {
            toggleForm(registerForm);
            loginForm.classList.add('form-hidden');
            loginForm.classList.remove('form-active');
        });
    }

    // Real-time Password Validation Feedback
    if (passwordInput && passwordStrengthText) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            let strengthMessage = getPasswordStrengthMessage(password);
            passwordStrengthText.textContent = strengthMessage;
        });
    }

    if (confirmPasswordInput && passwordMatchText) {
        confirmPasswordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            passwordMatchText.textContent = password !== confirmPassword ? "Passwords do not match." : "";
        });
    }

    function getPasswordStrengthMessage(password) {
        let message = '';
        if (password.length < 8) message += 'Password is too short. ';
        if (!/[A-Z]/.test(password)) message += 'Missing uppercase letter. ';
        if (!/\d/.test(password)) message += 'Missing a number. ';
        if (!/[!@#$%^&*]/.test(password)) message += 'Missing a special character. ';
        return message || "Strong password!";
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Event listener for registration form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const registrationData = {
                username: document.getElementById('username').value,
                first_name: document.getElementById('first-name').value,
                last_name: document.getElementById('last-name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to register.');
                return response.json();
            })
            .then(data => {
                alert('Registration successful!');
                // Optionally set token received from server and redirect
                // localStorage.setItem('token', data.token);
                window.location.href = '/login.html'; // Redirect to login page
            })
            .catch(error => {
                console.error('Error during registration:', error);
                alert('Registration error: ' + error.message);
            });
        });
    }

    // Event listener for login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const loginData = {
                username: document.getElementById('login-username').value,
                password: document.getElementById('login-password').value
            };

            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to log in.');
                return response.json();
            })
            .then(data => {
                alert('Login successful!');
                // Set token received from server and redirect
                localStorage.setItem('token', data.token);
                window.location.href = data.redirect; // Redirect to profile page or wherever necessary
            })
            .catch(error => {
                console.error('Error during login:', error);
                alert('Login error: ' + error.message);
            });
        });
    }
});
