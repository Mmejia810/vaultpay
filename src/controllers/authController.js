const bcrypt = require('bcryptjs');
const  pool = require('../config/database');
const jwt = require('jsonwebtoken');


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

const login = async (req, res) => {
    const { correo, password } = req.body

    try {
        const result = await pool.query('SELECT * FROM users WHERE correo = $1', [correo])
        const user = result.rows[0]

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' })
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ message: 'Login exitoso', userId: user.id, token })
    } catch (error) {
        console.error('Error al iniciar sesión:', error)
        res.status(500).json({ message: 'Error al iniciar sesión' })
    }
}

module.exports = {
  register,
  login
}

