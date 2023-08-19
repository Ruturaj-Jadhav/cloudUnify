const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET;
const client = require("../models/db");
const localStorage = require("local-storage");
const {generateToken} = require("../middlewares/authmiddleware")


exports.signup = async (req, res) => {
    const userEmail = req.body.email;
    const password = req.body.password;
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const createUserQuery = "INSERT INTO users (email, password_hash) VALUES ($1, $2)";
        
        const values = [userEmail, hashedPassword];
        
        const result = await client.query(createUserQuery, values);

        console.log(result);

        res.status(201).json({ message: "User created successfully!" });
    } catch (err) {
        if (err.constraint === 'users_email_key') {
            // Handle duplicate email error
            res.status(400).json({ error: "Email address is already in use." });
        } else {
            console.error("Error creating user:", err);
            res.status(500).json({ error: "An error occurred while creating the user." });
        }
    }
};


exports.signin = async (req, res) => {
    const userEmail = req.body.email;
    const password = req.body.password;

    const retrieve = "SELECT * FROM users WHERE email = $1";

    try {
        const data = await client.query(retrieve, [userEmail]);

        if (data.rowCount === 0) {
            res.status(401).json({ error: "User not found. Please Sign Up." });
            return;
        }

        const hashedPassword = data.rows[0].password_hash;

        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (!passwordMatch) {
            res.status(401).json({ error: "Invalid Password." });
            return;
        }

        const token = await generateToken(data.rows[0].id); // Call the generateToken function
        console.log("Token created successfully");
        res.status(200).json({ message: "Login successful.", token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "An error occurred during login." });
    }
};

exports.check =(req,res,next) => {
    console.log("Check");
}




