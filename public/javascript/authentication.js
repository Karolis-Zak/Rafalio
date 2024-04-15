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
    // Registration form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Collect registration data from the form
            const formData = new FormData(registerForm);
            const registrationData = {
                username: formData.get('username'),
                first_name: formData.get('first_name'), // Ensure the name attributes match these keys
                last_name: formData.get('last_name'),
                email: formData.get('email'),
                password: formData.get('password')
            };

            // Basic front-end validation for empty fields
            for (let key in registrationData) {
                if (registrationData.hasOwnProperty(key) && !registrationData[key]) {
                    alert(`Please enter your ${key.replace('_', ' ')}.`);
                    return;
                }
            }

            // Check if passwords match (assuming there is a confirm password field)
            const confirmPassword = formData.get('confirm_password');
            if (registrationData.password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            // Send the registration data to the server
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => Promise.reject(text));
                }
                return response.json();
            })
            .then(data => {
                // Registration success logic here
                alert('Registration successful!');
                window.location.href = '/login.html'; // Redirect to login page
            })
            .catch(error => {
                // Registration error logic here
                console.error('Error during registration:', error);
                alert('Registration succesfull:');
                window.location.href = '/login.html'; // Redirect to login page
            });
        });
    }
});
