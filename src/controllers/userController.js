const pool = require('../config/database');

const getProfile = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query('SELECT id, nombre, apellido, identificacion, telefono, correo, direccion FROM users WHERE id = $1', [userId]);
        const user = result.rows[0];
        res.status(200).json(user);
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil' });
    }
};

module.exports = { getProfile };