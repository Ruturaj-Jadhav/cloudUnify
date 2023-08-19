const express = require("express");
const { google } = require("googleapis");
const fs = require("fs");
const readline = require("readline");
const client = require("../models/db");
const localStorage = require("local-storage");


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

// instance created
const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// callback function
exports.oauth2callback = async (req, res) => {
  const code = req.query.code;
  auth.getToken(code, (err, token) => {
    if (err) return console.error("Error retrieving access token", err);
    auth.setCredentials(token);

    console.log(token);
    
    const text = "INSERT INTO google_tokens(user_id, access_token, refresh_token, expires_at) VALUES ($1, $2, $3, $4)";

    try {
      const jwt = localStorage.get("jwt"); /* Assuming you have a way to decode the JWT */
      const expiresInMs = token.expiry_date - Date.now(); // Calculate remaining time until expiration
      const expiresAt = new Date(Date.now() + expiresInMs);

      const values = [
        2,
        token.access_token,
        token.refresh_token,
        expiresAt
      ];
      
      // Assuming you have a 'client' object properly configured
      client.query(text, values, (err, result) => {
        if (err) {
          console.error("Error storing token in database:", err);
        } else {
          console.log("Token stored in database:", result);
        }
      });
    } catch (err) {
      console.error(err);
    }

    fs.writeFileSync("token.json", JSON.stringify(token));
    console.log("Token stored to token.json");
    res.send("Authorization successful! You can close this window.");
  });
};


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getAccessToken() {
  const authUrl = auth.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url:", authUrl);
  console.log(
    "Once authorized, please return to the terminal and press Enter."
  );
  rl.question("", () => {
    rl.close();
  });
}




function listFiles() {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list(
      {
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
      },
      (err, res) => {
        if (err) return console.error('The API returned an error:', err.message);
  
        const files = res.data.files;
        if (files.length) {
          console.log('Files:');
          files.forEach((file) => {
            console.log(`${file.name} (${file.id})`);
          });
        } else {
          console.log('No files found.');
        }
      }
    );
  }
  
  
  exports.initialize = (req,res) =>{
    if (fs.existsSync('token.json')) {
        const token = JSON.parse(fs.readFileSync('token.json'));
        auth.setCredentials(token);
        listFiles();
      } else {
        getAccessToken();
      }
    };
