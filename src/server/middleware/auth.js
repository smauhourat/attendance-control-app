// middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');

// Proteger rutas
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // Verificar si existe el token en los headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Obtener token del header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        // Obtener token de cookies
        token = req.cookies.token;
    }

    // Verificar que el token exista
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No está autorizado para acceder a esta ruta'
        });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Obtener el usuario correspondiente al token
        req.user = await User.findById(decoded.id);

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'No está autorizado para acceder a esta ruta'
        });
    }
});

// Otorgar acceso a roles específicos
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'No está autorizado para acceder a esta ruta'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `El rol ${req.user.role} no está autorizado para acceder a esta ruta`
            });
        }

        next();
    };
};