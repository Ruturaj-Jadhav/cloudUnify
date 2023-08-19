const express = require("express");
const jwt = require("jsonwebtoken");
const localStorage = require("local-storage");
const JWT_SECRET = process.env.JWT_SECRET;
const client = require("../models/db");

// Authentication middleware

exports.authMiddleware = async (req, res, next) => {
    const token = localStorage.get('jwt');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: 'Unauthorized' });
    }
};
exports.generateToken = async (user_id) => {
  const timestamp = new Date();
  const expirationTimestamp = new Date(timestamp.getTime() + 12 * 60 * 60 * 1000); // 12 hours later

  const token = jwt.sign(
      {
          id: user_id
      },
      JWT_SECRET,
      { expiresIn: "12h" }
  );

  const tokenquery = "INSERT INTO user_tokens (user_id, token, expiration_timestamp, issued_timestamp) VALUES ($1, $2, $3, $4)";

  const data = {
      user_id: user_id,
      token: token,
      expiration_timestamp: expirationTimestamp,
      issued_timestamp: timestamp
  };

  try {
      await client.query(tokenquery, [data.user_id, data.token, data.expiration_timestamp, data.issued_timestamp]);
      return token;
  } catch (error) {
      console.error(error);
      throw new Error("Error generating token.");
  }
};
