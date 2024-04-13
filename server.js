require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

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
    const { username, firstName, lastName, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send('Username, email, and password are required');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery = `INSERT INTO users (username, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)`;
        db.query(insertQuery, [username, firstName, lastName, email, hashedPassword], (err, results) => {
            if (err) {
                return res.status(500).send('Error registering new user.');
            }
            res.status(201).send('User registered successfully');
        });
    } catch (error) {
        res.status(500).send('Server error while hashing password');
    }
});

// User Login Endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            return res.status(500).send('Error on the server.');
        }
        if (results.length === 0 || !await bcrypt.compare(password, results[0].password)) {
            return res.status(401).send('Wrong login details, please try again.');
        }
        const token = jwt.sign({ userId: results[0].user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login Successful', token, redirect: '/profile.html' });
    });
});

// Raffle Posting Endpoint
app.post('/api/raffles', (req, res) => {
    const { title, description, endTime } = req.body;
    const insertRaffleQuery = 'INSERT INTO raffles (title, description, endTime) VALUES (?, ?, ?)';
    db.query(insertRaffleQuery, [title, description, endTime], (err, result) => {
        if (err) {
            res.status(500).send('Error posting raffle');
        } else {
            res.status(201).json({ message: 'Raffle posted successfully', raffleId: result.insertId });
        }
    });
});

// Fetch User Info (Protected Route)
app.get('/api/user-info', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const query = 'SELECT first_name, last_name, email FROM users WHERE user_id = ?';
    db.query(query, [decoded.userId], (err, results) => {
        if (err) {
            return res.status(500).send('Server error');
        }
        if (results.length > 0) {
            res.json({
                firstName: results[0].first_name,
                lastName: results[0].last_name,
                email: results[0].email
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});



//-----------------------------------------------------------Raffle Fetching Endpoint



app.get('/api/raffles', (req, res) => {
    const query = 'SELECT * FROM raffles';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error fetching raffles');
        } else {
            res.json(results);
        }
    });
});
// Enroll User in Raffle Function
function enrollUserInRaffle(userId, raffleId, callback) {
    console.log(`Enrolling user with ID ${userId} into raffle with ID ${raffleId}`);

    if (isNaN(userId)) {
        console.error('Invalid userId:', userId);
        return callback(new Error('Invalid user ID format'), null);
    }
    
    if (!raffleId) {
        console.error('Raffle ID is not provided');
        return callback(new Error('Raffle ID is not provided'), null);
    }

    // Attempt to parse raffleId as BIGINT
    try {
        const bigRaffleId = BigInt(raffleId);
        const insertEntryQuery = 'INSERT INTO raffle_entries (user_id, raffle_id, entry_time) VALUES (?, ?, NOW())';
        db.query(insertEntryQuery, [userId, bigRaffleId.toString()], (err, results) => {
            if (err) {
                console.error('Database error when enrolling in raffle:', err);
                return callback(err, null);
            }
            callback(null, results);
        });
    } catch (error) {
        console.error('Invalid raffleId format:', raffleId);
        return callback(new Error('Invalid raffle ID format'), null);
    }
}






// Enroll User in Raffle Endpoint
app.post('/api/enroll-raffle', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send('No token provided.');
    }
    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
    } catch (error) {
        return res.status(401).send('Failed to authenticate token.');
    }

    const raffleId = req.body.raffleId; // Keep as string to handle BIGINT safely

    if (!raffleId) {
        return res.status(400).send('Raffle ID is required.');
    }

    enrollUserInRaffle(userId, raffleId, (error, result) => {
        if (error) {
            res.status(400).send('Error enrolling in raffle: ' + error.message);
        } else {
            res.send('Enrolled in raffle successfully.');
        }
    });
});




// Select Winner Function
function selectWinner() {
    const selectRafflesQuery = `
        SELECT raffle_id FROM raffles
        WHERE end_time < NOW() AND winner_id IS NULL
    `;

    db.query(selectRafflesQuery, (err, raffles) => {
        if (err) {
            return console.error('Error selecting raffles for winner assignment:', err);
        }

        raffles.forEach(raffle => {
            const selectWinnerQuery = `
                SELECT user_id FROM raffle_entries
                WHERE raffle_id = ?
                ORDER BY RAND()
                LIMIT 1
            `;
            
            db.query(selectWinnerQuery, [raffle.raffle_id], (err, winners) => {
                if (err) {
                    return console.error('Error selecting winner for raffle:', raffle.raffle_id, err);
                }

                if (winners.length > 0) {
                    const winnerId = winners[0].user_id;
                    const updateRaffleQuery = `
                        UPDATE raffles
                        SET winner_id = ?
                        WHERE raffle_id = ?
                    `;

                    db.query(updateRaffleQuery, [winnerId, raffle.raffle_id], (err, result) => {
                        if (err) {
                            return console.error('Error updating raffle with winner:', raffle.raffle_id, err);
                        }
                        console.log(`Winner selected for raffle ${raffle.raffle_id}: user ${winnerId}`);
                        // Optional: send email to the winner using nodemailer
                    });
                } else {
                    console.log(`No entries found for raffle ${raffle.raffle_id}. No winner selected.`);
                }
            });
        });
    });
}

// Schedule the winner selection to run every hour
cron.schedule('0 * * * *', selectWinner);

// Error handling for uncaught exceptions and unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Application specific logging, throwing an error, or other logic here
});

// Additional server code (if any)

// Start the server after the DB connection is established
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    } else {
        console.log('Connected to MySQL');
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    }
});

app.get('/api/user-raffles', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send('No token provided.');
    }
    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
    } catch (error) {
        return res.status(401).send('Failed to authenticate token.');
    }

    const query = `
        SELECT r.raffle_id, r.raffle_name, r.description, r.end_time
        FROM raffle_entries re
        JOIN raffles r ON re.raffle_id = r.raffle_id
        WHERE re.user_id = ?
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});
