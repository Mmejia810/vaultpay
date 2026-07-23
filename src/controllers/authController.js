const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const jwt = require("jsonwebtoken");
const { createaccount } = require("./accountController");
const { auditLog } = require("../middlewares/auditLogger");

const register = async (req, res) => {
    const {
        nombre,
        apellido,
        identificacion,
        telefono,
        correo,
        direccion,
        password,
        fecha_nacimiento,
    } = req.body;

    const hoy = new Date();
    const nacimiento = new Date(fecha_nacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumple = new Date(
        hoy.getFullYear(),
        nacimiento.getMonth(),
        nacimiento.getDate(),
    );
    const edadReal = hoy >= cumple ? edad : edad - 1;

    if (
        !nombre ||
        !apellido ||
        !identificacion ||
        !telefono ||
        !correo ||
        !direccion ||
        !password ||
        !fecha_nacimiento
    ) {
        return res
            .status(400)
            .json({ message: "Todos los campos son obligatorios" });
    }
    if (password.length < 6) {
        return res
            .status(400)
            .json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }
    if (!/\d/.test(password)) {
        return res
            .status(400)
            .json({ message: "La contraseña debe contener al menos un número" });
    }
    if (!/[A-Z]/.test(password)) {
        return res
            .status(400)
            .json({
                message: "La contraseña debe contener al menos una letra mayúscula",
            });
    }
    if (!/[a-z]/.test(password)) {
        return res
            .status(400)
            .json({
                message: "La contraseña debe contener al menos una letra minúscula",
            });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return res
            .status(400)
            .json({
                message: "La contraseña debe contener al menos un carácter especial",
            });
    }
    if (/\s/.test(password)) {
        return res
            .status(400)
            .json({ message: "La contraseña no puede contener espacios" });
    }
    if (/(.)\1{2,}/.test(password)) {
        return res
            .status(400)
            .json({
                message:
                    "La contraseña no puede contener más de dos caracteres consecutivos iguales",
            });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento)) {
        return res
            .status(400)
            .json({
                message: "La fecha de nacimiento debe tener el formato YYYY-MM-DD",
            });

    }
    if (new Date(fecha_nacimiento) > new Date()) {
        return res
            .status(400)
            .json({ message: "La fecha de nacimiento no puede ser en el futuro" });
    }

    if (edadReal < 18) {
        return res
            .status(400)
            .json({ message: "Debes ser mayor de 18 años para registrarte" });
    }

    if (new Date(fecha_nacimiento) < new Date("1900-01-01")) {
        return res
            .status(400)
            .json({
                message:
                    "La fecha de nacimiento no puede ser antes del 1 de enero de 1900",
            });

    }


    if (isNaN(Date.parse(fecha_nacimiento))) {
        return res
            .status(400)
            .json({ message: "La fecha de nacimiento no es válida" });
    }


    if (!/^\d{10}$/.test(telefono)) {
        return res
            .status(400)
            .json({ message: "El número de teléfono debe tener 10 dígitos" });
    }
    if (!/^\d{10}$/.test(identificacion)) {
        return res
            .status(400)
            .json({ message: "La identificación debe tener 10 dígitos" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        return res
            .status(400)
            .json({ message: "El correo electrónico no es válido" });
    }
    if (!/^[a-zA-Z0-9\s,'-]*$/.test(nombre)) {
        return res
            .status(400)
            .json({ message: "El nombre no puede contener caracteres especiales" });
    }
    if (!/^[a-zA-Z0-9\s,'-]*$/.test(apellido)) {
        return res
            .status(400)
            .json({ message: "El apellido no puede contener caracteres especiales" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (nombre, apellido, identificacion, telefono, correo, direccion, password, fecha_nacimiento, fecha_registro) VALUES ($1, $2, $3, $4, $5, $6, $7,$8, NOW()) RETURNING id",
            [
                nombre,
                apellido,
                identificacion,
                telefono,
                correo,
                direccion,
                hashedPassword,
                fecha_nacimiento,
            ],
        );
        await auditLog(result.rows[0].id, 'REGISTRO_EXITOSAMENTE', req.ip, 'exitoso');

        // Crear cuenta para el nuevo usuario
        const accountId = await createaccount(result.rows[0].id, "savings", 0);
        res
            .status(201)
            .json({
                message: "Usuario registrado exitosamente",
                userId: result.rows[0].id,
                accountId,
            });
    } catch (error) {
        await auditLog(null, 'REGISTRO_FALLIDO', req.ip, 'fallido');
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ message: "Error al registrar usuario" });
    }

};


const login = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE correo = $1", [
            correo,
        ]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "15 minutes",
        });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "7 days",
        });
        await pool.query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days') RETURNING id", [
            user.id,
            refreshToken,
        ]);
        await auditLog(user.id, "login", req.ip, 'exitoso');
        res.status(200).json({ message: "Login exitoso", userId: user.id, token, refreshToken });

    } catch (error) {
        await auditLog(null, 'LOGIN_FALLIDO', req.ip, 'fallido')
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }


};

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;



    try {
        const result = await pool.query("SELECT * FROM refresh_tokens WHERE token = $1", [
            refreshToken,
        ]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (new Date(user.expires_at) < new Date()) {
            return res.status(401).json({ message: 'Refresh token expirado' })
        }

        if (!user.token) {
            return res.status(404).json({ message: "Token no encontrado" });
        }

        if (user.token !== refreshToken) {
            return res.status(401).json({ message: "Token incorrecto" });
        }

        const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
            expiresIn: "15 minutes",
        });

        await auditLog(user.user_id, "refresh_token", req.ip, 'exitoso');
        res.status(200).json({ message: "Token actualizado", userId: user.user_id, token });

    } catch (error) {
        await auditLog(null, 'REFRESH_TOKEN_FALLIDO', req.ip, 'fallido')
        console.error("Error al actualizar token:", error);
        res.status(500).json({ message: "Error al actualizar token" });
    }

};

const logout = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(400).json({ message: 'Token no proporcionado' })
    }

    try {
        await pool.query(
            'INSERT INTO token_blacklist (token) VALUES ($1)',
            [token]
        )
        await auditLog(req.user?.userId, 'logout', req.ip, 'exitoso')
        res.status(200).json({ message: 'Sesión cerrada exitosamente' })
    } catch (error) {
        await auditLog(null, 'LOGOUT_FALLIDO', req.ip, 'fallido')
        console.error('Error al cerrar sesión:', error)
        res.status(500).json({ message: 'Error al cerrar sesión' })
    }
}

module.exports = {
    register,
    login,
    refreshToken,
    logout,
};
