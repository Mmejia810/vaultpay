const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware').authenticateToken;
const userController = require('../controllers/userController');
const accountController = require('../controllers/accountController');
const getProfile = userController.getProfile;
const getBalance = accountController.getbalance;
const updateProfile = userController.updateProfile;
const deleteProfile = userController.deleteProfile;
const getProfileById = userController.getProfileById;
const changePassword = userController.changePassword;



const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.get('/balance', authenticateToken, getBalance);
router.put('/profile', authenticateToken, updateProfile);
router.delete('/profile', authenticateToken, deleteProfile);
router.get('/profile/:id', authenticateToken, getProfileById);
router.put('/change-password', authenticateToken, changePassword);
module.exports = router;
