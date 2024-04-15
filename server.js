require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
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
        process.exit(1);
    }
    console.log('Connected to MySQL');
});

// Middleware to authenticate and set user id
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
// User Registration Endpoint
app.post('/register', async (req, res) => {
    const { username, first_name, last_name, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send('Username, email, and password are required');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = `INSERT INTO users (username, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)`;
        db.query(insertQuery, [username, first_name, last_name, email, hashedPassword], (err, results) => {
            if (err) {
                console.error('Error registering new user:', err);
                return res.status(500).send('Error registering new user.');
            }
            res.status(201).send('User registered successfully');
        
        });
    } catch (error) {
        console.error('Server error while hashing password:', error);
        res.status(500).send('Server error while hashing password');
    }
});

// User Login Endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT user_id, password FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Database error during login:', err);
            return res.status(500).send('Server error');
        }
        if (results.length === 0 || !await bcrypt.compare(password, results[0].password)) {
            return res.status(401).send('Incorrect username or password.');
        }
        const token = jwt.sign({ userId: results[0].user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login Successful', token, redirect: '/profile.html' });
    });
});

// Endpoint to create a new raffle
app.post('/api/raffles', authenticateToken, (req, res) => {
    const { raffle_name, description, end_time } = req.body;
    const insertRaffleQuery = 'INSERT INTO raffles (raffle_name, description, end_time) VALUES (?, ?, ?)';
    db.query(insertRaffleQuery, [raffle_name, description, end_time], (err, result) => {
        if (err) {
            console.error('Error creating raffle:', err);
            return res.status(500).send('Error creating raffle');
        }
        res.status(201).json({ message: 'Raffle created successfully', raffleId: result.insertId });
    });
});

// Endpoint to fetch all raffles
app.get('/api/raffles', authenticateToken, (req, res) => {
    const selectRafflesQuery = 'SELECT * FROM raffles';
    db.query(selectRafflesQuery, (err, results) => {
        if (err) {
            console.error('Error fetching raffles:', err);
            return res.status(500).send('Error fetching raffles');
        }
        res.json(results);
    });
});

// Endpoint to enroll in a raffle
app.post('/api/enroll-raffle', authenticateToken, (req, res) => {
    const { raffleId } = req.body;
    const userId = req.user.userId; // Corrected to use req.user.userId
    const insertEntryQuery = 'INSERT INTO raffle_entries (user_id, raffle_id) VALUES (?, ?)';
    db.query(insertEntryQuery, [userId, raffleId], (err, result) => {
        if (err) {
            console.error('Error enrolling in raffle:', err);
            return res.status(500).json({ message: 'Error enrolling in raffle', error: err });
        }
        res.status(201).json({ message: 'Successfully enrolled in raffle', entryId: result.insertId });
    });
});

// Endpoint to fetch raffles a user is enrolled in
app.get('/api/user-raffles', authenticateToken, (req, res) => {
    const userId = req.user.userId; // Corrected to use req.user.userId
    const selectUserRafflesQuery = `
        SELECT r.raffle_name, r.description, r.end_time 
        FROM raffle_entries re
        JOIN raffles r ON re.raffle_id = r.raffle_id
        WHERE re.user_id = ?;
    `;
    db.query(selectUserRafflesQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user raffles:', err);
            return res.status(500).send('Error fetching user raffles');
        }
        res.json(results);
    });
});

// Endpoint to get user information for the profile
app.get('/api/user-info', authenticateToken, (req, res) => {
    const query = 'SELECT username, first_name, last_name, email FROM users WHERE user_id = ?';
    db.query(query, [req.user.userId], (err, results) => {
        if (err) {
            console.error('Database error during profile fetch:', err);
            return res.status(500).json({ message: 'Error fetching user profile' });
        }
        if (results.length > 0) {
            return res.json(results[0]);
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
