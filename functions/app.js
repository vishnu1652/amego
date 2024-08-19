const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const path = require('path');
const dbPromise = require('./db'); // Adjust path if needed
const { log } = require('console');

const app = express();
const router = express.Router();
const port = 3001;
// Use the router for all routes
app.use('/.netlify/functions/app', router);
// app.use('/', router);
const cors = require('cors');
app.use(cors());
// Middleware to parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Serve the HTML file
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'homePage.html')); // Path to HTML file
});
router.get('/hyy', (req, res) => {
  return "hii"; // Path to HTML file
});

// Handle form submission
app.post('/submit', async (req, res) => {
  console.log(req)
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  try {
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).send('Passwords do not match!');
    }

    const db = await dbPromise; // Get the database instance

    // Insert data into the database
    const result = await db.run('INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)', [firstName, lastName, email, password]);
    console.log('User inserted with ID:', result.lastID);

    // Send a response to the client
    res.send('Form submitted successfully!');
  } catch (error) {
    console.error('Error inserting user:', error);
    res.status(500).send('Server error');
  }
});

// New route to get all users
router.get('/feujiusers', async (req, res) => {
  try {
    const db = await dbPromise; // Get the database instance

    // Fetch all users from the database
    const rows = await db.all('SELECT * FROM users');
    res.json(rows); // Respond with JSON containing the users
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
});

// Use the router for all routes
// app.use('/.netlify/functions/app', router);

// Start the server for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);

    try {
      const db = await dbPromise; // Get the database instance

      // Initialize the database and create the table if it doesn't exist
      await db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )
      `);
      console.log('Database initialized and users table created.');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  });
}

module.exports.handler = serverless(app);
