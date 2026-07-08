const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware').authenticateToken;
const { transferByKey } = require('../controllers/keyController');
const { createKey } = require('../controllers/keyController');

router.use(authenticateToken);
router .post('/create', createKey);
router.post('/transfer', transferByKey);

module.exports = router;