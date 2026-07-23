const express = require('express');
const authController = require('../controllers/authController');
const valideregister = require('../middlewares/validators').valideregister;
const validatelogin = require('../middlewares/validators').validatelogin;
const router = express.Router();
const refreshToken = require('../controllers/authController').refreshToken

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - correo
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               correo:
 *                 type: string
 *               password:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/register', valideregister, authController.register);

/** 
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contraseña
 *             properties:
 *               correo:
 *                 type: string
 *               contraseña:
 *                 type: string
 *     responses:
 *       201:
 *         description: login exitoso
 *       400:
 *         description: Error de validación
 */
router.post('/login', validatelogin, authController.login);

/**
 * @swagger
 * /api/auth/refreshToken:
 *   post:
 *     summary: Actualizar token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Token actualizado exitoso
 *       400:
 *         description: Error de validación
 */
router.post('/refreshToken', refreshToken);

module.exports = router;