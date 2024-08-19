const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Enable verbose mode for SQLite
sqlite3.verbose();

// Create and open a connection to the SQLite database
const db = open({
  filename: './amego.db', // Path to your SQLite database file
  driver: sqlite3.Database
});

module.exports = db;
