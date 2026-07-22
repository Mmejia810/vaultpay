const pool = require('../config/database')



const auditLog = async (userId, accion, ip, estado) => {

    try {
        await pool.query(
            'INSERT INTO audit_logs (user_id, accion, ip, estado) VALUES ($1, $2, $3, $4)',
            [userId, accion, ip, estado]
        )
    }
    catch (error) {
        console.error('Error al registrar log:', error)
    }

};

module.exports = {
    auditLog,
}