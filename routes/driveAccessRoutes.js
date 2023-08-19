const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authmiddleware');
const {oauth2callback} = require('../controllers/driveAccessController');

const {initialize} = require('../controllers/driveAccessController');

initialize();

router.get('/oauth2callback' , oauth2callback);

module.exports = router;