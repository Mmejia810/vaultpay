const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido.' });
        }

        const blacklisted = await pool.query(
            'SELECT * FROM token_blacklist WHERE token = $1',
            [token]
        )
        if (blacklisted.rows.length > 0) {
            return res.status(401).json({ message: 'Token inválido, sesión cerrada' })
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };