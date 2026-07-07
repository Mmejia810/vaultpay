const express = require('express');
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middlewares/authMiddleware').authenticateToken;

const router = express.Router();


router.post('/transfer', authenticateToken, transactionController.transfer);
router.get('/history', authenticateToken, transactionController.getTransactionHistory);

module.exports = router;
