const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET;
const client = require("../models/db");


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
        console.error("Error creating user:", err);
        res.status(500).json({ error: "An error occurred while creating the user." });
    }
};


