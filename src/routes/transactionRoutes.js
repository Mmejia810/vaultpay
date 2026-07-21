const express = require('express');
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middlewares/authMiddleware').authenticateToken;
const validateTransfer = require('../middlewares/validators').validateTransfer;

const router = express.Router();

/**
 * @swagger
 * /api/transaction/transfer:
 *   post:
 *     summary: Realizar transferencia
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to_account_number
 *               - amount
 *             properties:
 *               to_account_number:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Transferencia exitosa
 *       400:
 *         description: Error de validación
 */
router.post('/transfer', authenticateToken, validateTransfer, transactionController.transfer);

/**
 * @swagger
 * /api/transaction/history:
 *   get:
 *     summary: Ver historial de transacciones
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Resultados por página
 *     responses:
 *       200:
 *         description: Historial de transacciones
 *       401:
 *         description: No autorizado
 */
router.get('/history', authenticateToken, transactionController.getTransactionHistory);

module.exports = router;
