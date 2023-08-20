const express = require("express");
const jwt = require("jsonwebtoken");
const localStorage = require("local-storage");
const JWT_SECRET = process.env.JWT_SECRET;
const client = require("../models/db");

// Authentication middleware

exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user_id = decoded.id;

        let query = "SELECT * FROM users WHERE id= $1";
        let params = [user_id];
        const result = await client.query(query, params);
        if (result.rowCount < 1) {
            return res.status(401).json({ error: 'Invalid User!' });
        }

        req.user = result.rows[0];
        req.token = token;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Invalid token.' });
    }
} catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Unauthorized user!' });
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
