const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer'); // Add multer
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// Configure multer to handle form data
const upload = multer();

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // For urlencoded forms
app.use(bodyParser.json()); // For JSON payloads
app.use(express.static(__dirname));

mongoose.connect('mongodb://localhost:27017/signupDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'contact.kunalmeena@gmail.com',
        pass: 'ruud sqtt gkiw xijw' // Replace with your working App Password
    }
});

let otpStore = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/signup', upload.none(), (req, res) => {
    console.log('POST /signup received:', req.body);
    const { username, email, password, confirmPassword } = req.body || {};
    if (!password || !confirmPassword || password !== confirmPassword) return res.send('Passwords do not match!');
    const newUser = new User({ username, email, password });
    newUser.save().then(() => res.send('Signup successful!')).catch(err => res.send('Error: ' + err));
});

app.post('/login', upload.none(), (req, res) => {
    console.log('POST /login received:', req.body);
    const { email, password } = req.body || {};
    if (!email || !password) return res.send('Email and password are required!');
    User.findOne({ email, password })
        .then(user => res.send(user ? 'Login successful!' : 'Invalid email or password!'))
        .catch(err => res.send('Error: ' + err));
});

app.post('/forgot-password', upload.none(), (req, res) => {
    console.log('POST /forgot-password received:', req.body);
    const email = req.body.email;
    if (!email) return res.send('Email is required!');

    User.findOne({ email })
        .then(user => {
            if (!user) return res.send('Email not found!');
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            otpStore[email] = otp;

            const mailOptions = {
                from: 'contact.kunalmeena@gmail.com',
                to: email,
                subject: 'Password Reset OTP',
                text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Email sending error:', error);
                    return res.send('Error sending OTP: ' + error.message);
                }
                console.log('Email sent:', info.response);
                res.send(`OTP sent to ${email}`);
            });
        })
        .catch(err => {
            console.log('Database error:', err);
            res.send('Error: ' + err);
        });
});

app.post('/verify-otp', upload.none(), (req, res) => {
    console.log('POST /verify-otp received:', req.body);
    const { otp, email } = req.body || {};
    if (!otp || !email) return res.send('OTP and email are required!');
    if (otpStore[email] && otpStore[email] === otp) {
        delete otpStore[email];
        res.send('OTP verified!');
    } else {
        res.send('Invalid OTP!');
    }
});

app.post('/reset-password', upload.none(), (req, res) => {
    console.log('POST /reset-password received:', req.body);
    const { email, newPassword, confirmNewPassword } = req.body || {};
    if (!email || !newPassword || !confirmNewPassword) return res.send('All fields are required!');
    if (newPassword !== confirmNewPassword) return res.send('Passwords do not match!');
    User.findOneAndUpdate({ email }, { password: newPassword }, { new: true })
        .then(user => res.send(user ? 'Password reset successful!' : 'Error: User not found!'))
        .catch(err => res.send('Error: ' + err));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
