document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const loginToggle = document.getElementById('login-toggle');
    const registerToggle = document.getElementById('register-toggle');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Initially hide both forms
    loginForm.classList.add('form-hidden');
    registerForm.classList.add('form-hidden');

    // Event listeners for toggles
    loginToggle.addEventListener('click', () => {
        toggleForm(loginForm);
    });

    registerToggle.addEventListener('click', () => {
        toggleForm(registerForm);
    });

    // Function to toggle form visibility
    function toggleForm(form) {
        if (form.classList.contains('form-hidden')) {
            // Show this form
            form.classList.remove('form-hidden');
            form.classList.add('form-active');
            // Hide the other form
            if (form === loginForm) {
                registerForm.classList.add('form-hidden');
                registerForm.classList.remove('form-active');
            } else {
                loginForm.classList.add('form-hidden');
                loginForm.classList.remove('form-active');
            }
        } else {
            // Hide the form if it's already shown
            form.classList.add('form-hidden');
            form.classList.remove('form-active');
        }
    }


    // Real-time Password Validation Feedback
    const passwordInput = document.getElementById('password');
    const passwordStrengthText = document.getElementById('password-strength');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordMatchText = document.getElementById('password-match');

    passwordInput.addEventListener('input', () => updatePasswordStrength(passwordInput, passwordStrengthText));
    confirmPasswordInput.addEventListener('input', () => updatePasswordMatch(passwordInput, confirmPasswordInput, passwordMatchText));

    function updatePasswordStrength(passwordInput, strengthText) {
        const password = passwordInput.value;
        let strengthMessage = getPasswordStrengthMessage(password);
        strengthText.textContent = strengthMessage;
    }

    function getPasswordStrengthMessage(password) {
        let message = '';
        if (password.length < 8) message += 'Password is too short. ';
        if (!/[A-Z]/.test(password)) message += 'Missing uppercase letter. ';
        if (!/\d/.test(password)) message += 'Missing a number. ';
        if (!/[!@#$%^&*]/.test(password)) message += 'Missing a special character. ';
        return message || "Perfect!";
    }

    function updatePasswordMatch(passwordInput, confirmPasswordInput, matchText) {
        matchText.textContent = passwordInput.value !== confirmPasswordInput.value ? "Passwords do not match." : "";
    }

    document.getElementById('register-form').addEventListener('submit', function(e) {
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

        // Sending the registration data to the server
        passwordStrengthText.textContent = "";
        // Proceed with the AJAX request to register the user
        const username = document.querySelector('#register-form input[type="text"][placeholder="Username"]').value;
        const firstName = document.querySelector('#register-form input[type="text"][placeholder="First Name"]').value;
        const lastName = document.querySelector('#register-form input[type="text"][placeholder="Last Name"]').value;
        const email = document.querySelector('#register-form input[type="email"]').value;

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.querySelector('#register-form input[name="username"]').value,
                firstName: document.querySelector('#register-form input[name="firstName"]').value,
                lastName: document.querySelector('#register-form input[name="lastName"]').value,
                email: document.querySelector('#register-form input[name="email"]').value,
                password: document.querySelector('#register-form input[id="password"]').value
            })
        })
        .then(response => response.text())
        .then(data => {
            alert(data); // Display response from the server
        });
        
});


});
