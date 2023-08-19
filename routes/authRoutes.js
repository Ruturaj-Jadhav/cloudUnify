const express = require('express');
const {signup , signin , check} = require("../controllers/authController");
const router = express.Router();

router.post('/signup' , signup);
router.post('/signin', signin);



module.exports = router;