const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const personController = require('../controllers/personController');
const attendanceController = require('../controllers/attendanceController');

// Middleware de autenticación
const { protect, authorize } = require('../middleware/auth');

// Rutas principales de eventos
router.route('/')
    .get(eventController.getEvents)
    //.post(protect, authorize('admin'), eventController.createEvent);
    .post(eventController.createEvent);

router.route('/:id')
    .get(eventController.getEvent)
    .put(eventController.updateEvent)
    .delete(eventController.deleteEvent);

// Personas asociadas a un evento
router.route('/:eventId/persons')
    .get(personController.getEventPersons);

// Asistencias del evento
router.route('/:eventId/attendance')
    .get(attendanceController.getEventAttendance);

// Verificar asistencia específica
router.route('/:eventId/persons/:personId/attendance')
    .get(attendanceController.checkAttendance);

router.route('/:eventId/attendance/stats')
    .get(attendanceController.getEventAttendanceStats);    
    //.get(protect, attendanceController.getEventAttendanceStats);    

module.exports = router;
