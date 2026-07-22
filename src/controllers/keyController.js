const pool = require('../config/database')
const getAccountByUserId = require('../controllers/accountController').getAccountByUserId
const updateAccountBalance = require('../controllers/accountController').updateAccountBalance
const { auditLog } = require("../middlewares/auditLogger");


const createKey = async (req, res) => {
    let { key_type, key_value } = req.body
    const userId = req.user.userId

    try {
        const account = await getAccountByUserId(userId)

        if (!account) {
            return res.status(404).json({ message: 'Cuenta no encontrada' })
        }
        if (key_type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key_value)) {
            return res.status(400).json({ message: 'Formato de correo electrónico inválido' })
        }
        if (key_type === 'phone' && !/^\+?[1-9]\d{1,14}$/.test(key_value)) {
            return res.status(400).json({ message: 'Formato de número de teléfono inválido' })
        }
        if (key_type === 'random' && key_value.length !== 12) {
            return res.status(400).json({ message: 'La clave aleatoria debe tener 12 caracteres' })
        }
        if (key_type === 'random') {
            const randomKey = Math.random().toString(36).substring(2, 14)
            key_value = randomKey
        }
        if (key_type === 'email' || key_type === 'phone') {
            const existingKey = await pool.query(
                'SELECT * FROM keys WHERE key_type = $1 AND key_value = $2',
                [key_type, key_value]
            )

            if (existingKey.rows.length > 0) {
                return res.status(400).json({ message: 'La clave ya está en uso' })
            }

        }
        await pool.query(
            'INSERT INTO keys (account_id, key_type, key_value) VALUES ($1, $2, $3)',
            [account.id, key_type, key_value]
        )

        await auditLog(userId, 'Crear clave', req.ip, 'exitosa');

        res.status(201).json({ message: 'Clave creada exitosamente' })
    }
    catch (error) {
        await auditLog(userId, 'Crear clave', req.ip, 'fallida');
        console.error('Error al crear la clave:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }

}

const getByKey = async (req, res) => {
    const { key_value } = req.params

    try {
        const keyResult = await pool.query(
            'SELECT * FROM keys WHERE key_value = $1',
            [key_value]
        )
        const key = keyResult.rows[0]

        if (!key) {
            return res.status(404).json({ message: 'Clave no encontrada' })
        }
        await auditLog(null, 'Obtener clave', req.ip, 'exitosa');

        res.status(200).json({ key })
    }
    catch (error) {
        await auditLog(null, 'Obtener clave', req.ip, 'fallida');
        console.error('Error al obtener la clave:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

const getByKeyType = async (req, res) => {
    const { key_type } = req.params

    try {
        const keyResult = await pool.query(
            'SELECT * FROM keys WHERE key_type = $1',
            [key_type]
        )
        const keys = keyResult.rows
        await auditLog(null, 'Obtener claves por tipo', req.ip, 'exitosa');

        res.status(200).json({ keys })
    }
    catch (error) {
        await auditLog(null, 'Obtener claves por tipo', req.ip, 'fallida');
        console.error('Error al obtener las claves por tipo:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

const deleteKey = async (req, res) => {
    const { key_value } = req.params
    const userId = req.user.userId

    try {
        const account = await getAccountByUserId(userId)
        if (!account) {
            return res.status(404).json({ message: 'Cuenta no encontrada' })
        }
        if (!key_value) {
            return res.status(400).json({ message: 'Faltan parámetros requeridos' })
        }


        const keyResult = await pool.query(
            'DELETE FROM keys WHERE key_value = $1 AND account_id = $2 RETURNING *',
            [key_value, account.id]
        )
        const deletedKey = keyResult.rows[0]

        if (!deletedKey) {
            return res.status(404).json({ message: 'Clave no encontrada o no pertenece a tu cuenta' })
        }
        await auditLog(userId, 'Eliminar clave', req.ip, 'exitosa');

        res.status(200).json({ message: 'Clave eliminada exitosamente' })
    }
    catch (error) {
        await auditLog(null, 'Eliminar clave', req.ip, 'fallida');
        console.error('Error al eliminar la clave:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

const transferByKey = async (req, res) => {
    const { key_value, amount } = req.body
    const userId = req.user.userId

    try {
        const fromAccount = await getAccountByUserId(userId)

        if (!fromAccount) {
            return res.status(404).json({ message: 'Cuenta de origen no encontrada' })
        }
        if (!key_value || !amount) {
            return res.status(400).json({ message: 'Faltan parámetros requeridos' })
        }
        if (parseFloat(amount) <= 0) {
            return res.status(400).json({ message: 'El monto debe ser mayor a cero' })
        }
        if (parseFloat(amount) > parseFloat(fromAccount.balance)) {
            return res.status(400).json({ message: 'Fondos insuficientes' })
        }
        if (parseFloat(amount) > 3000000) {
            return res.status(400).json({ message: 'El monto excede el límite máximo de transferencia' })
        }


        const keyResult = await pool.query(
            'SELECT * FROM keys WHERE key_value = $1',
            [key_value]
        )
        const key = keyResult.rows[0]

        if (!key) {
            return res.status(404).json({ message: 'Clave no encontrada' })
        }

        const toAccountResult = await pool.query(
            'SELECT * FROM accounts WHERE id = $1',
            [key.account_id]
        )
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

        const newFromBalance = parseFloat(fromAccount.balance) - parseFloat(amount)
        const newToBalance = parseFloat(toAccount.balance) + parseFloat(amount)

        await pool.query('BEGIN')
        await updateAccountBalance(fromAccount.id, newFromBalance)
        await updateAccountBalance(toAccount.id, newToBalance)


        await pool.query('INSERT INTO transactions (from_account_id, to_account_id, amount, status) VALUES ($1, $2, $3, $4)',
            [fromAccount.id, toAccount.id, amount, 'completada']


        )

        await pool.query('COMMIT')
        await auditLog(userId, 'Transferencia por clave', req.ip, 'exitosa');

        res.status(200).json({ message: 'Transferencia realizada con éxito' })
    }


    catch (error) {
        await auditLog(null, 'Transferencia por clave', req.ip, 'fallida');
        console.error('Error al realizar la transferencia:', error)
        res.status(500).json({ message: 'Error interno del servidor' })

        await pool.query('ROLLBACK')
    }

}

module.exports = {
    createKey,
    getByKey,
    getByKeyType,
    deleteKey,
    transferByKey
}












