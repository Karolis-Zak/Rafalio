const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // Include JWT for session management


const app = express();
const port = 3000;
// MySQL Database Connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Zaksauskas123',
    database: 'rafalio'
});
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Middleware setup
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory (if you have one)
app.use(express.static('public'));



// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kzaksauskasss@gmail.com',
        pass: 'vhpw jhgd hgjs mlnd'
    }
});

// Newsletter Signup Endpoint
app.post('/signup-newsletter', async (req, res) => {
    const { email } = req.body;
    // TODO: Store email in database
    // Send email
    const mailOptions = {
        from: 'kzaksauskasss@gmail.com',
        to: email,
        subject: 'Thank you for signing up!',
        text: 'We appreciate your interest in our newsletter!'
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


// Contact Form Submission Endpoint
app.post('/send-contact-email', (req, res) => {
    const { name, email, message } = req.body;
    const mailOptions = {
        from: 'kzaksauskasss@gmail.com',
        to: 'kzaksauskasss@gmail.com', // Developer's email
        subject: `New Contact Form Submission from ${name}`,
        text: `You have received a new message from your contact form.\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            return res.send('Message sent successfully');
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






// Save user's article to their profile
app.post('/api/save-article', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const { article } = req.body;  // Assuming 'article' contains 'article_id'

    if (!article || !article.article_id) {
        return res.status(400).json({ error: 'Article or Article ID not provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const insertQuery = `INSERT INTO saved_articles (user_id, article_id, article_data) VALUES (?, ?, ?)`;
        db.query(insertQuery, [decoded.userId, article.article_id, JSON.stringify(article)], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Error saving article' });
            }
            res.json({ message: 'Article saved successfully' });
        });
    } catch (error) {
        console.error('JWT error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});



app.get('/api/events', async (req, res) => {
    try {
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '7500e03755mshd6dfeb9e7696dbep15b2c6jsn463e282ead72',
                'X-RapidAPI-Host': 'calendars.p.rapidapi.com'
            }
        };
        const response = await fetch('https://calendars.p.rapidapi.com/ical_fetch?c=US&json=true', options);
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error fetching events');
    }
});





app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
