const pool = require('../config/database');
const bcrypt = require('bcryptjs');

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

    const changePassword = async (req, res) => {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        try {
            const result = await pool.query('SELECT password, nombre, apellido, correo, identificacion, telefono FROM users WHERE id = $1', [userId]);
            const user = result.rows[0];

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            if (!await bcrypt.compare(currentPassword, user.password)) {
                return res.status(400).json({ message: 'Contraseña actual incorrecta' });
            }
            if (currentPassword === newPassword) {
                return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la actual' });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres' });
            }
            if (!/[A-Z]/.test(newPassword)) {
                return res.status(400).json({ message: 'La nueva contraseña debe contener al menos una letra mayúscula' });
            }
            if (!/[a-z]/.test(newPassword)) {
                return res.status(400).json({ message: 'La nueva contraseña debe contener al menos una letra minúscula' });
            }
            if (!/[0-9]/.test(newPassword)) {
                return res.status(400).json({ message: 'La nueva contraseña debe contener al menos un número' });
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
                return res.status(400).json({ message: 'La nueva contraseña debe contener al menos un carácter especial' });
            }
            if (/\s/.test(newPassword)) {
                return res.status(400).json({ message: 'La nueva contraseña no puede contener espacios' });
            }
            if (/(.)\1{2,}/.test(newPassword)) {
                return res.status(400).json({ message: 'La nueva contraseña no puede contener más de dos caracteres consecutivos iguales' });
            }
            if (newPassword.toLowerCase().includes(user.correo.toLowerCase())) {
                return res.status(400).json({ message: 'La nueva contraseña no puede contener tu correo electrónico' });
            }
            if (newPassword.toLowerCase().includes(user.nombre.toLowerCase())) {
                return res.status(400).json({ message: 'La nueva contraseña no puede contener tu nombre' });
            }
            if (newPassword.toLowerCase().includes(user.apellido.toLowerCase())) {
                return res.status(400).json({ message: 'La nueva contraseña no puede contener tu apellido' });
            }
            
            if (newPassword.toLowerCase().includes(String(user.identificacion).toLowerCase())) {
                return res.status(400).json({ message: 'La nueva contraseña no puede contener tu identificación' });
            }
            if (newPassword.toLowerCase().includes(String(user.telefono).toLowerCase())) {
                return res.status(400).json({ message: 'La nueva contraseña no puede contener tu teléfono' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
            res.status(200).json({ message: 'Contraseña actualizada correctamente' });
        }

        catch (error) {
            console.error('Error al cambiar la contraseña:', error);
            res.status(500).json({ message: 'Error al cambiar la contraseña' });
        }


    };


module.exports = { getProfile, updateProfile, deleteProfile, getProfileById, changePassword };


