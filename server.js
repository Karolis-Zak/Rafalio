require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// MySQL Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});



// User Registration Endpoint
app.post('/register', async (req, res) => {
    console.log(req.body); // This will show you the entire request body
    console.log(typeof req.body.password); // Specifically checks the type of the password
    const { username, firstName, lastName, email, password } = req.body;
    


    if (!username || !email || !password) {
        return res.status(400).send('Username, email, and password are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = `INSERT INTO users (username, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)`;
        db.query(insertQuery, [username, firstName, lastName, email, hashedPassword], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    // Handle duplicate entry error
                    return res.status(409).json({ error: 'This email or username already exists.' });
                } else {
                    // Handle other errors
                    console.error('Database error:', err);
                    return res.status(500).send('Error registering new user.');
                }
            }
            // Successfully created user
            res.status(201).send('User registered successfully');
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send('Server error while hashing password');
    }
});


// User Login Endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';

    db.query(query, [username], async (err, results) => {
        if (err) {
            // Server error handling
            return res.status(500).send('Error on the server.');
        }

        if (results.length === 0 || !await bcrypt.compare(password, results[0].password)) {
            // Either username does not exist or password does not match
            return res.status(401).send('Wrong login details, please try again.');
        }

        // User authenticated, create token
        const token = jwt.sign({ userId: results[0].user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Send token and redirect to profile page
        res.json({ message: 'Login Successful', token, redirect: '/profile.html' });
    });
});


// JWT Secret Key
const JWT_SECRET = 'https://jwt.io/#debugger-io?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o';



// User Login Endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';

    db.query(query, [username], async (err, results) => {
        if (err) {
            return res.status(500).send('Error on the server.');
        }

        if (results.length === 0) {
            return res.status(401).send('Username does not exist');
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token });
        } else {
            res.status(401).send('Username or password is incorrect');
        }
    });
});



// Raffle Posting Endpoint
app.post('/api/raffles', (req, res) => {
    const { title, description, endTime } = req.body;
    const insertRaffleQuery = 'INSERT INTO raffles (title, description, endTime) VALUES (?, ?, ?)';
    db.query(insertRaffleQuery, [title, description, endTime], (err, result) => {
        if (err) {
            console.error('Error posting raffle:', err);
            res.status(500).send('Error posting raffle');
        } else {
            res.status(201).json({ message: 'Raffle posted successfully', raffleId: result.insertId });
        }
    });
});



// Fetch User Info (Protected Route)
app.get('/api/user-info', (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Correctly extract the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use the JWT_SECRET from your .env file
        const query = 'SELECT first_name, last_name, email FROM users WHERE user_id = ?';
        
        db.query(query, [decoded.userId], (err, results) => {
            if (err) {
                throw err;
            }
            if (results.length > 0) {
                // Ensure you're sending back a JSON object with the right keys
                res.json({
                    firstName: results[0].first_name,
                    lastName: results[0].last_name,
                    email: results[0].email
                });
            } else {
                res.status(404).send('User not found');
            }
        });
    } catch (error) {
        res.status(401).send('Invalid token');
    }
});

// Raffle Fetching Endpoint
app.get('/api/raffles', (req, res) => {
    const query = 'SELECT * FROM raffles';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching raffles:', err);
            res.status(500).send('Error fetching raffles');
        } else {
            res.json(results);
        }
    });
});



// Fetch User Info (Protected Route)
app.get('/api/user-info', (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const query = 'SELECT first_name, last_name, email FROM users WHERE user_id = ?';
        db.query(query, [decoded.userId], (err, results) => {
            if (err) {
                throw err;
            }
            if (results.length > 0) {
                res.json(results[0]);
            } else {
                res.status(404).send('User not found');
            }
        });
    } catch (error) {
        res.status(401).send('Invalid token');
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
