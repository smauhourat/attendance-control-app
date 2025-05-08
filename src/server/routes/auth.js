// routes/auth.js
const express = require('express');
const { register, login, getMe, logout, updatePassword } = require('../controllers/authController');

// Middleware de autenticación
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;