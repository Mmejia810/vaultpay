const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware').authenticateToken;
const { transferByKey, getByKey, getByKeyType, deleteKey, createKey} = require('../controllers/keyController');

router.use(authenticateToken);
router .post('/create', createKey);
router.post('/transfer', transferByKey);
router.get('/:key_value', getByKey);
router.get('/type/:key_type', getByKeyType);
router.delete('/:key_value', deleteKey);

module.exports = router;