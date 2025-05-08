// controllers/authController.js
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const jwt = require('jsonwebtoken');

// @desc    Registrar un usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Crear el usuario
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'user' // Por defecto es 'user', solo un admin puede crear otro admin
    });

    sendTokenResponse(user, 201, res);
});

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validar email y password
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Por favor proporcione un email y contraseña'
        });
    }

    // Verificar si el usuario existe
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Credenciales inválidas'
        });
    }

    // Verificar si la contraseña coincide
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            error: 'Credenciales inválidas'
        });
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Obtener el usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Cerrar sesión / limpiar cookie
// @route   GET /api/auth/logout
// @access  Public
exports.logout = asyncHandler(async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000), // 10 segundos
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Actualizar contraseña
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('+password');

    // Verificar contraseña actual
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return res.status(401).json({
            success: false,
            error: 'Contraseña actual incorrecta'
        });
    }

    // Actualizar contraseña
    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// Función para enviar el token en la respuesta
const sendTokenResponse = (user, statusCode, res) => {
    // Crear token
    const token = user.getSignedJwtToken();

    // Opciones para la cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // 30 días
        ),
        httpOnly: true
    };

    // Usar HTTPS en producción
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    // Eliminar la contraseña del resultado
    user.password = undefined;

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            data: user
        });
};