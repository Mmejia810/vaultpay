const pool = require('../config/database')
const { getAccountByUserId, updateAccountBalance } = require('./accountController')


const transfer = async (req, res) => {
    const { to_acccount_number, amount } = req.body
    const userId = req.user.userId

    try {
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

       const newFromBalance = parseFloat(fromAccount.balance) - parseFloat(amount)
        const newToBalance = parseFloat(toAccount.balance) + parseFloat(amount)

        // Actualizar la cuenta de origen
        await updateAccountBalance(fromAccount.id, newFromBalance)

        // Actualizar la cuenta de destino
        await updateAccountBalance(toAccount.id, newToBalance)


        await pool.query(
            'INSERT INTO transactions (from_account_id, to_account_id, amount) VALUES ($1, $2, $3)',
            [fromAccount.id, toAccount.id, amount]
        )

        res.status(200).json({ message: 'Transferencia realizada con éxito' })
    } catch (error) {
        console.error('Error al realizar la transferencia:', error)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

module.exports = { transfer }