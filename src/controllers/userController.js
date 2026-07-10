const pool = require('../config/database');

const getProfile = async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query('SELECT id, nombre, apellido, identificacion, telefono, correo, direccion FROM users WHERE id = $1 ', [userId]);
        const user = result.rows[0];
        res.status(200).json(user);
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil' });
    }
};

const updateProfile = async (req, res) => {
    const userId = req.user.userId;
    const { nombre, apellido, telefono, direccion } = req.body;

    try {
        const result = await pool.query(
            'UPDATE users SET nombre = COALESCE($1, nombre), apellido = COALESCE($2, apellido), telefono = COALESCE($3, telefono), direccion = COALESCE($4, direccion) WHERE id = $5 RETURNING id, nombre, apellido, telefono, direccion, correo',
            [nombre, apellido, telefono, direccion, userId]
        );
        const updatedUser = result.rows[0];
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(500).json({ message: 'Error al actualizar el perfil' });
    }
};

const deleteProfile = async (req, res) => {
    const userId = req.user.userId;
    try {
        await pool.query('UPDATE users SET deletion_requested_at = NOW() WHERE id = $1', [userId]);
        res.status(200).json({ message: 'Tu cuenta será eliminada en 10 días' });
    }

    catch (error) {
        console.error('Error al eliminar el perfil:', error);
        res.status(500).json({ message: 'Error al eliminar el perfil' });
    }
};

const getProfileById = async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query('SELECT id, nombre, apellido, identificacion, telefono, correo, direccion FROM users WHERE id = $1 ', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const user = result.rows[0];
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error al obtener el perfil por ID:', error);
        res.status(500).json({ message: 'Error al obtener el perfil por ID' });
    }
};


module.exports = { getProfile, updateProfile, deleteProfile, getProfileById };


