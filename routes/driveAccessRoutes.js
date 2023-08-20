const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middlewares/authmiddleware');
const {oauth2callback} = require('../controllers/driveAccessController');

const {initialize} = require('../controllers/driveAccessController');

router.get('/oauth2callback' , oauth2callback);
router.get('/drive',authMiddleware, initialize);

module.exports = router;