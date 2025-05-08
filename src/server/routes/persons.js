const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');
//const { checkAttendance } = require('../controllers/attendanceController');

// Middleware de autenticación
const { protect, authorize } = require('../middleware/auth');


// Rutas para personas
router.route('/')
    .get(personController.getPersons)
    //.post(protect, personController.createPerson);
    .post(personController.createPerson);

router.route('/:id')
    .get(personController.getPerson)
    .put(personController.updatePerson)
    //.delete(protect, authorize('admin'), personController.deletePerson);
    .delete(personController.deletePerson);

//// Verificar asistencia de una persona en un evento específico
////router.route('/:personId/events/:eventId/attendance').get(checkAttendance);
    
module.exports = router;
