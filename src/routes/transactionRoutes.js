const express = require('express');
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middlewares/authMiddleware').authenticateToken;
const validateTransfer = require('../middlewares/validators').validateTransfer;

const router = express.Router();


router.post('/transfer', authenticateToken, validateTransfer, transactionController.transfer);
router.get('/history', authenticateToken, transactionController.getTransactionHistory);

module.exports = router;
