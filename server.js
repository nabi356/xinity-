const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const MONGODB_URI = "mongodb+srv://dancernabi_db_user:Nabi2005@cluster0.blsmvvs.mongodb.net/xinityHackathon?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    teamSize: { type: String, required: true },
    passcode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Real Registration Endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { teamName, email, teamSize, passcode } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email is already registered." });
        }

        // Hash passcode
        const salt = await bcrypt.genSalt(10);
        const hashedPasscode = await bcrypt.hash(passcode, salt);

        // Create user
        const newUser = new User({
            teamName,
            email,
            teamSize,
            passcode: hashedPasscode
        });

        await newUser.save();
        console.log(`New user registered: ${email}`);
        res.status(201).json({ success: true, message: "Registration successful!" });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Server error during registration." });
    }
});

// Real Login Endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, passcode } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials: User not found." });
        }

        // Verify pass
        const isMatch = await bcrypt.compare(passcode, user.passcode);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials: Bad passcode." });
        }

        console.log(`User logged in: ${email}`);
        res.json({ success: true, message: "Login successful", redirect: "/dashboard.html" });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
