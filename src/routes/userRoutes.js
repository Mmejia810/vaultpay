const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware').authenticateToken;
const userController = require('../controllers/userController');
const getProfile = userController.getProfile;

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);

module.exports = router;
