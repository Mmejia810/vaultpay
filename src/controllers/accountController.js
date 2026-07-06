const  pool = require('../config/database');

const createaccount = async (userId,accountType, balance) => {

    const accountNumber = Math.floor(Math.random() * 9000000000) + 1000000000
    
    try {
        const result = await pool.query(
            'INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, accountNumber, accountType, balance]
        )
        return result.rows[0].id
    } catch (error) {
        console.error('Error al crear cuenta:', error
        )
    }
}

const getAccountByUserId = async (userId) => {
    try {
        const result = await pool.query('SELECT * FROM accounts WHERE user_id = $1', [userId])
        return result.rows[0]
    } catch (error) {
        console.error('Error al obtener cuenta por ID de usuario:', error)
    }
}

const getbalance = async (req, res) => {
    const userId = req.user.userId
    const account = await getAccountByUserId(userId)
    if (!account) {
        return res.status(404).json({ message: 'Cuenta no encontrada' })
    }
    res.status(200).json({ balance: account.balance })
}


const updateAccountBalance = async (accountId, newBalance) => {
    try {
        await pool.query('UPDATE accounts SET balance = $1 WHERE id = $2', [newBalance, accountId])
    } catch (error) {
        console.error('Error al actualizar saldo de cuenta:', error)
    }
}



module.exports = {
    createaccount,
    getAccountByUserId,
    updateAccountBalance,
    getbalance
}