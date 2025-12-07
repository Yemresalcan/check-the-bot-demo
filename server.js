const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize Database
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE users (id INT, username TEXT, password TEXT)");
    db.run("INSERT INTO users VALUES (1, 'admin', 'supersecret123')");
    db.run("INSERT INTO users VALUES (2, 'user', 'password123')");
});

// Vulnerable Login Route
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // VULNERABILITY: SQL Injection via string concatenation
    const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
    
    console.log("Executing Query: " + query); // Log for demonstration

    db.get(query, (err, row) => {
        if (err) {
            res.status(500).send("Database error");
        } else if (row) {
            res.send(`<h1>Login Successful!</h1><p>Welcome, ${row.username}</p>`);
        } else {
            res.send("<h1>Login Failed</h1><p>Invalid credentials</p><a href='/'>Try again</a>");
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
