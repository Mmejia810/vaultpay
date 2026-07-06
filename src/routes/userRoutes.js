const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware').authenticateToken;
const userController = require('../controllers/userController');
const accountController = require('../controllers/accountController');
const getProfile = userController.getProfile;
const getBalance = accountController.getbalance;



const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.get('/balance', authenticateToken, getBalance);
module.exports = router;
