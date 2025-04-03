const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files from current directory

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Forgot Password route
app.post('/forgot-password', (req, res) => {
    console.log('POST /forgot-password received:', req.body);
    res.send('Forgot password route is working!');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});