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


/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Obtener perfil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente 
 *       400:
 *         description: Error de validación
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /api/user/balance:
 *   get:
 *     summary: Obtener Saldo
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo obtenido exitosamente 
 *       400:
 *         description: Error de validación
 */
router.get('/balance', authenticateToken, getBalance);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Actualizar perfil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       401:
 *         description: No autorizado
 */
router.put('/profile', authenticateToken, updateProfile);

/**
 * @swagger
 * /api/user/profile:
 *   delete:
 *     summary: eliminar perfil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil eliminado exitosamente 
 *       400:
 *         description: Error de validación
 */
router.delete('/profile', authenticateToken, deleteProfile);

/**
 * @swagger
 * /api/user/profile/{id}:
 *   get:
 *     summary: Obtener perfil por id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente por id
 *       400:
 *         description: Error de validación
 */
router.get('/profile/:id', authenticateToken, getProfileById);

/**
 * @swagger
 * /api/user/change-password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *       401:
 *         description: No autorizado
 */

router.put('/change-password', authenticateToken, changePassword);

module.exports = router;
