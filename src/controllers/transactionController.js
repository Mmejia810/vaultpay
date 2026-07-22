const pool = require('../config/database')
const { getAccountByUserId, updateAccountBalance } = require('./accountController')
const { auditLog } = require("../middlewares/auditLogger");



const transfer = async (req, res) => {
    const { to_account_number, amount } = req.body
    const userId = req.user.userId



    try {
        await pool.query('BEGIN')

        const fromAccount = await getAccountByUserId(userId)
        if (!fromAccount) {
            return res.status(404).json({ message: 'Cuenta de origen no encontrada' })
        }

        if (fromAccount.balance < amount) {
            return res.status(400).json({ message: 'Saldo insuficiente' })
        }
        const toAccountResult = await pool.query('SELECT * FROM accounts WHERE account_number = $1', [to_account_number])
        const toAccount = toAccountResult.rows[0]

        if (!toAccount) {
            return res.status(404).json({ message: 'Cuenta de destino no encontrada' })
        }

        if (fromAccount.id === toAccount.id) {
            return res.status(400).json({ message: 'No se puede transferir a la misma cuenta' })
        }

        const dailyResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as total 
             FROM transactions 
             WHERE from_account_id = $1 
            AND created_at >= CURRENT_DATE
             AND status = 'completada'`,
            [fromAccount.id]
        )
        const dailyTotal = parseFloat(dailyResult.rows[0].total)

        if (dailyTotal + parseFloat(amount) > 3000000) {
            return res.status(400).json({ message: 'Límite diario de transferencia excedido' })
        }


        const newFromBalance = parseFloat(fromAccount.balance) - parseFloat(amount)
        const newToBalance = parseFloat(toAccount.balance) + parseFloat(amount)

        // Actualizar la cuenta de origen
        await updateAccountBalance(fromAccount.id, newFromBalance)

        // Actualizar la cuenta de destino
        await updateAccountBalance(toAccount.id, newToBalance)


        await pool.query(
            'INSERT INTO transactions (from_account_id, to_account_id, amount, status) VALUES ($1, $2, $3, $4)',
            [fromAccount.id, toAccount.id, amount, 'completada']
        )
        await pool.query('COMMIT')

        await auditLog(userId, 'Transferencia', req.ip, 'exitosa');

        res.status(200).json({ message: 'Transferencia realizada con éxito' })
    } catch (error) {
        await auditLog(null, 'Transferencia', req.ip, 'fallida');
        await pool.query('ROLLBACK')
        console.error('Error al realizar la transferencia:', error)
        res.status(500).json({ message: 'Error interno del servidor' })


    }

}

const getTransactionHistory = async (req, res) => {
    const userId = req.user.userId

    try {

        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        const account = await getAccountByUserId(userId)
        const transactions = await pool.query(
            'SELECT * FROM transactions WHERE from_account_id = $1 OR to_account_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [account.id, limit, offset]
        )
        await auditLog(userId, "Obtener historial de transacciones", req.ip, 'exitosa');
        res.status(200).json({ transactions: transactions.rows, page, limit, total: transactions.rows.length })

    } catch (error) {
        await auditLog(null, 'Obtener historial de transacciones', req.ip, 'fallida');
        console.error('Error al obtener el historial de trans   acciones:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }


}




module.exports = { transfer, getTransactionHistory }