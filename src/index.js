const express = require('express')
const pool = require('./config/database')
const cors = require('cors')
require('dotenv').config();
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const transactionRoutes = require('./routes/transactionRoutes')




const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/transaction', transactionRoutes)
app.get('/', (req, res) => {
  res.json({ message: 'VaultPay API funcionando' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({ message: 'Conexión a la base de datos exitosa', time: result.rows[0].now })
    } catch (error) {
    console.error('Error al conectar a la base de datos:', error)
    res.status(500).json({ message: 'Error al conectar a la base de datos' })
  }


})