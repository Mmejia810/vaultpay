const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware').authenticateToken;
const { transferByKey, getByKey, getByKeyType, deleteKey, createKey} = require('../controllers/keyController');

router.use(authenticateToken);


/**
 * @swagger
 * /api/key/create:
 *   post:
 *     summary: Crear llave
 *     tags: [Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key_type:
 *                 type: string
 *               key_value:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Llave creada  exitosamente
 *       401:
 *         description: No autorizado
 */

router .post('/create', createKey);

/**
 * @swagger
 * /api/key/transfer:
 *   post:
 *     summary: Tranferir por llave
 *     tags: [Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key_value:
 *                 type: string
 *               amount:
 *                 type: nunmber
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tranferencia por llave exitosamente
 *       401:
 *         description: No autorizado
 */
router.post('/transfer', transferByKey);

/**
 * @swagger
 * /api/key/{key_value}:
 *   get:
 *     summary: Obtener llave
 *     tags: [Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Llave  obtenida exitosamente 
 *       400:
 *         description: Error de validación
 */
router.get('/:key_value', getByKey);

/**
 * @swagger
 * /api/key/type/{key_type}:
 *   get:
 *     summary: Obtener llave por su tipo
 *     tags: [Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Llave  obtenida exitosamente 
 *       400:
 *         description: Error de validación
 */
router.get('/type/:key_type', getByKeyType);

/**
 * @swagger
 * /api/key/{key_value}:
 *   delete:
 *     summary: Borrar llave
 *     tags: [Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Llave borrada exitosamente 
 *       400:
 *         description: Error de validación
 */
router.delete('/:key_value', deleteKey);

module.exports = router;