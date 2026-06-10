const bcrypt = require('bcryptjs');
const  pool = require('../config/database');


const register = async (req, res) => {
    const { nombre , apellido, identificacion, telefono , correo, direccion, password } = req.body
    

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await pool.query(
            
            'INSERT INTO users (nombre, apellido, identificacion, telefono, correo, direccion, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [nombre , apellido, identificacion, telefono , correo, direccion, hashedPassword]
        )
        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.rows[0].id })
    } catch (error) {
        console.error('Error al registrar usuario:', error)
        res.status(500).json({ message: 'Error al registrar usuario' })
    }
}

module.exports = {
  register,
}