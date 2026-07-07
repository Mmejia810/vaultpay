const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware').authenticateToken;
const userController = require('../controllers/userController');
const accountController = require('../controllers/accountController');
const transactionController = require('../controllers/transactionController');
const getProfile = userController.getProfile;
const getBalance = accountController.getbalance;
const transfer = transactionController.transfer;



const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.get('/balance', authenticateToken, getBalance);
router.post('/transfer', authenticateToken, transfer);
module.exports = router;
