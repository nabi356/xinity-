const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const multer = require('multer');
const fs = require('fs');

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
    leaderName: { type: String, required: true },
    member2Name: { type: String, default: "" },
    member3Name: { type: String, default: "" },
    collegeName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    teamSize: { type: String, required: true },
    passcode: { type: String, required: true },
    logoData: { type: String, default: "" },
    pdfData: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Configure Multer for Vercel Serverless (Memory Storage - No disk writing)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage, 
    limits: { fileSize: 4 * 1024 * 1024 } // 4MB Vercel Serverless Hard Limit
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Real Registration Endpoint (Requires multipart/form-data for Logo upload)
app.post('/api/register', upload.single('teamLogo'), async (req, res) => {
    try {
        const { teamName, leaderName, member2Name, member3Name, collegeName, email, teamSize, passcode } = req.body;
        
        // Convert the RAM file buffer directly into a persistent Base64 encoded string
        const logoData = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : "";

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
            leaderName,
            member2Name,
            member3Name,
            collegeName,
            email,
            teamSize,
            passcode: hashedPasscode,
            logoData
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
        res.json({ success: true, message: "Login successful", redirect: "/submissions.html" });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});

// GET Endpoint for Public Gallery
app.get('/api/teams', async (req, res) => {
    try {
        // Find all users but only return the public fields
        const teams = await User.find({}, 'teamName leaderName member2Name member3Name collegeName logoData pdfData');
        res.json({ success: true, teams });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching teams." });
    }
});

// POST Endpoint for 100MB PDF Upload
app.post('/api/upload-pdf', upload.single('projectPdf'), async (req, res) => {
    try {
        const { email, passcode } = req.body;

        // Security Validation
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: "Team not found." });
        
        const isMatch = await bcrypt.compare(passcode, user.passcode);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials." });

        if (!req.file) return res.status(400).json({ success: false, message: "No PDF file attached." });

        // Save PDF Base64 text string directly into MongoDB
        user.pdfData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        await user.save();

        res.json({ success: true, message: "PDF Uploaded successfully!" });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ success: false, message: "Error uploading document." });
    }
});

// Vercel Serverless Export configuration
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running locally on http://localhost:${PORT}`);
    });
}

module.exports = app;
