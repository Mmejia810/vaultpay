const pool = require('../config/database')
const { getAccountByUserId, updateAccountBalance } = require('./accountController')



const transfer = async (req, res) => {
    const { to_acccount_number, amount } = req.body
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
        const toAccountResult = await pool.query('SELECT * FROM accounts WHERE account_number = $1', [to_acccount_number])
        const toAccount = toAccountResult.rows[0]

        if (!toAccount) {
            return res.status(404).json({ message: 'Cuenta de destino no encontrada' })
        }

        if (fromAccount.id === toAccount.id) {
            return res.status(400).json({ message: 'No se puede transferir a la misma cuenta' })
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

        res.status(200).json({ message: 'Transferencia realizada con éxito' })
    } catch (error) {

        await pool.query('ROLLBACK')
        console.error('Error al realizar la transferencia:', error)
        res.status(500).json({ message: 'Error interno del servidor' })

        
    }

}

const getTransactionHistory = async (req, res) => {
    const userId = req.user.userId

    try {
        const account = await getAccountByUserId(userId)
        const transactions = await pool.query(
            'SELECT * FROM transactions WHERE from_account_id = $1 OR to_account_id = $1 ORDER BY created_at DESC',
            [account.id]
        )
        res.status(200).json({ transactions: transactions.rows })
    } catch (error) {
        console.error('Error al obtener el historial de trans   acciones:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
    
    
}

module.exports = { transfer, getTransactionHistory }