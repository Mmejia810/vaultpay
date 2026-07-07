const {body, validationResult} = require('express-validator')


const valideregister = [
    body('nombre')
        .notEmpty().withMessage('El nombre de usuario es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
    body('correo')
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('El correo electrónico no es válido'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('telefono')
        .notEmpty().withMessage('El teléfono es obligatorio')
        .isLength({ min: 10, max: 10 }).withMessage('El teléfono debe tener 10 dígitos')
        .isNumeric().withMessage('El teléfono debe ser numérico'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }
]

const validatelogin = [
    body('correo')
        .notEmpty().withMessage('El correo electrónico es obligatorio')
        .isEmail().withMessage('El correo electrónico no es válido'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }

]


const validateTransfer = [

    body('to_account_number')
        .notEmpty().withMessage('El número de cuenta de destino es obligatorio')
        .isLength({ min: 10, max: 10 }).withMessage('El número de cuenta debe tener 10 dígitos')
        .isNumeric().withMessage('El número de cuenta debe ser numérico'),

    body('amount')
        .notEmpty().withMessage('El monto es obligatorio')
        .isFloat({ gt: 0 }).withMessage('El monto debe ser un número mayor que cero'),

    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }

]

module.exports = {
    validateTransfer,
    valideregister, 
    validatelogin
}