require("dotenv").config({ path: "./backend/config.env" });
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*"}));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("Loaded API Key:", GEMINI_API_KEY); 

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "Eug",
    password: "@Eugie0003",
    database: "emergency_contacts"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database");
});
// Register Route
app.post("/register", async (req, res) => {
    try {
        console.log("Received register request:", req.body);
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if email already exists
        const emailCheckQuery = "SELECT * FROM users WHERE email = ?";
        db.query(emailCheckQuery, [email], async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: "Email already exists. Please use a different email." });
            }

            // Hash password and insert new user
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
            db.query(query, [name, email, hashedPassword], (err) => {
                if (err) {
                    console.error("Error inserting user:", err);
                    return res.status(500).json({ error: "Database error" });
                }
                res.status(201).json({ message: "User registered successfully!" });
            });
        });

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.post("/login", async (req, res) => {
    console.log("Received login request:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];

        // Verify password
        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id, email: user.email }, "your_secret_key", { expiresIn: "1h" });

            console.log("Login successful for user:", user.email);
            return res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (bcryptError) {
            console.error("Bcrypt error:", bcryptError);
            return res.status(500).json({ error: "Internal server error" });
        }
    });
});
// Save contact
app.post("/contacts", (req, res) => {
    const { user_id, name, phone } = req.body;

    if (!user_id || !name || !phone) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const normalizedPhone = phone.replace(/\D/g, ""); 

    // Check if the phone number already exists for the user
    const checkQuery = "SELECT COUNT(*) AS count FROM contacts WHERE user_id = ? AND phone = ?";
    db.query(checkQuery, [user_id, normalizedPhone], (err, results) => {
        if (err) {
            console.error("Error checking for duplicate contact:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results[0].count > 0) {
            return res.status(400).json({ error: "This phone number is already added as an emergency contact." });
        }

        // If no duplicate found, proceed with insertion
        const insertQuery = "INSERT INTO contacts (user_id, name, phone) VALUES (?, ?, ?)";
        db.query(insertQuery, [user_id, name, phone], (err) => {
            if (err) {
                console.error("Error saving contact:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json({ message: "Contact saved successfully!" });
        });
    });
});


// Fetch contacts for a user
app.get("/contacts/:user_id", (req, res) => {
    const { user_id } = req.params;

    const query = "SELECT * FROM contacts WHERE user_id = ?";
    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error("Error fetching contacts:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(200).json(results);
    });
});
//delete a contact
app.delete("/contacts/:id", (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid contact ID" });

    const sql = "DELETE FROM contacts WHERE id = ?";
    db.query(sql, [parseInt(id)], (err, result) => {
        if (err) {
            console.error("Database error:", err.sqlMessage);
            return res.status(500).json({ error: "Failed to delete contact" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Contact not found" });
        }

        res.json({ message: "Contact deleted successfully" });
    });
});
//connect with gemini
app.post("/gemini", async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log("Received prompt:", prompt); // ✅ Debug log

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] }
        );

        console.log("Gemini API Response:", response.data);
	
        const replyText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";

        res.json({ reply: replyText });
    } catch (error) {
        console.error("Error fetching Gemini response:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get response from Gemini API" });
    }
});

// Start Server
app.listen(3000, '0.0.0.0', () => {
    console.log("Server running on port 3000");
});
