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

    const registerFormElement = document.getElementById('register-form');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', function(e) {
            e.preventDefault();

            // Collect registration form data
            const registrationData = {
                username: document.querySelector('#register-form input[name="username"]').value,
                firstName: document.querySelector('#register-form input[name="firstName"]').value,
                lastName: document.querySelector('#register-form input[name="lastName"]').value,
                email: document.querySelector('#register-form input[name="email"]').value,
                password: document.querySelector('#register-form input[id="password"]').value,
                confirmPassword: document.querySelector('#register-form input[id="confirm-password"]').value,
            };

            // Simple front-end validation for example purposes
            if (registrationData.password !== registrationData.confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            // Proceed with the AJAX request to register the user
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: registrationData.username,
                    firstName: registrationData.firstName,
                    lastName: registrationData.lastName,
                    email: registrationData.email,
                    password: registrationData.password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Success - proceed to login or other actions
                    window.location.href = '/login'; // redirect to login page or profile
                } else {
                    // Handle errors, show message to user
                    alert("Registration failed: " + data.message);
                }
            })
            .catch(error => {
                console.error('Error during registration:', error);
                alert("Registration failed: " + error.message);
            });
        });
    } else {
        console.error('Register form not found!');
    }
});
