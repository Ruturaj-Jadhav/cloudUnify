const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: "config.env" });

require("./models/db")

const authroutes = require("./routes/authRoutes");
const driveAccessRoutes = require("./routes/driveAccessRoutes");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/user' , authroutes);
app.use('/',driveAccessRoutes);

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });



