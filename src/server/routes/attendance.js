// routes/attendance.js
const express = require('express');
const {
    getAttendances,
    recordAttendance,
    deleteAttendance
} = require('../controllers/attendanceController');

// Middleware de autenticación
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
    .route('/')
    //.get(protect, getAttendances)
    .get(getAttendances)
    .post(recordAttendance);
    //.post(protect, recordAttendance);

router
    .route('/:id')
    .delete(protect, authorize('admin'), deleteAttendance);

module.exports = router;