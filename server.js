require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

// MySQL Database Connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Zaksauskas123',
    database: 'codeh'
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

// Newsletter Signup Endpoint
app.post('/signup-newsletter', async (req, res) => {
    const { email } = req.body;
    // Store email in database logic here...
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Newsletter Signup Confirmation',
        text: 'Thank you for signing up for our newsletter!'
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Thank you for signing up for our newsletter!');
        }
    });
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
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) {
            res.status(401).send('Authentication failed');
        } else {
            const user = results[0];
            if (await bcrypt.compare(password, user.password)) {
                const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
                res.json({ message: 'Login successful', token });
            } else {
                res.status(401).send('Authentication failed');
            }
        }
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
            res.json({ message: 'Login Successful', token });
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



// User Info Endpoint
app.get('/api/user-info', (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const query = 'SELECT first_name, last_name, email FROM users WHERE id = ?';

        db.query(query, [decoded.userId], (err, results) => {
            if (err) {
                throw err;
            }
            res.json(results[0]);
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

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
