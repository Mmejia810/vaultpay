const express = require('express');
const authController = require('../controllers/authController');
const valideregister = require('../middlewares/validators').valideregister;
const validatelogin = require('../middlewares/validators').validatelogin;
const router = express.Router();

router.post('/register', valideregister, authController.register);
router.post('/login', validatelogin, authController.login);

module.exports = router;