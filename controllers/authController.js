const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET;
const client = require("../models/db");
const localStorage = require("local-storage");


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

    console.log(userEmail);

    const retrive  = "SELECT * FROM users WHERE email = $1";

    try {

        const data = await client.query(retrive,[userEmail]);

        if(data.rowCount == 0){ res.status(500).json({error: "User not found! Please Sign Up"}); } 
        else {

            const hashedPassword = data.rows[0].password_hash;

            console.log(hashedPassword);

            if(await bcrypt.compare(password, hashedPassword)){

                const token = jwt.sign(
                    {
                    id: data.rows[0].id,
                    email : data.rows[0].email
                    },
                    JWT_SECRET,
                    { expiresIn: "2h" }
                  );

                  localStorage.set(jwt , token);

                  console.log("Token created successfully")
              
            }
            else {
                res.json({ status: "error", error: "Invalid Password" });
            }
        }  
    }
    catch (err) {
        console.log(err);

    };

};


