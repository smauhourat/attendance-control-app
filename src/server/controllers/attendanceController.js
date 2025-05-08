const Attendance = require('../models/Attendance');
const Person = require('../models/Person');
const Event = require('../models/Event');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');

// @desc    Registrar asistencia
// @route   POST /api/attendance
// @access  Private
exports.recordAttendance = asyncHandler(async (req, res) => {
    const { eventId, personId } = req.body;

    // Verificar que el evento exista
    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({
            success: false,
            error: 'Evento no encontrado'
        });
    }

    // Verificar que el evento esté abierto
    if (event.status !== 'open') {
        return res.status(400).json({
            success: false,
            error: 'El evento está cerrado para registros de asistencia'
        });
    }

    // Verificar que la persona exista y esté asociada al evento
    const person = await Person.findOne({
        _id: personId,
        eventId: eventId
    });

    if (!person) {
        return res.status(404).json({
            success: false,
            error: 'Persona no encontrada o no asociada a este evento'
        });
    }

    // Verificar si ya existe un registro de asistencia
    let attendance = await Attendance.findOne({
        eventId: eventId,
        personId: personId
    });

    if (attendance) {
        return res.status(400).json({
            success: false,
            error: 'La asistencia ya ha sido registrada',
            data: attendance
        });
    }

    // Crear el registro de asistencia
    attendance = await Attendance.create({
        eventId,
        personId,
        recordedBy: req.user ? req.user.id : null,
        deviceInfo: req.body.deviceInfo || {}
    });

    res.status(201).json({
        success: true,
        data: attendance
    });
});

// @desc    Obtener todos los registros de asistencia
// @route   GET /api/attendance
// @access  Private
exports.getAttendances = asyncHandler(async (req, res) => {
    let query;

    // Copia de req.query
    const reqQuery = { ...req.query };

    // Campos a excluir
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Crear string de consulta
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Crear la consulta
    query = Attendance.find(JSON.parse(queryStr))
        .populate({
            path: 'eventId',
            select: 'name date status'
        })
        .populate({
            path: 'personId',
            select: 'name credentialNumber dni'
        });

    // Seleccionar campos específicos
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Ordenar
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-timestamp');
    }

    // Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Attendance.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Ejecutar consulta
    const attendances = await query;

    // Información de paginación
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: attendances.length,
        pagination,
        data: attendances
    });
});

// @desc    Obtener asistencia por evento
// @route   GET /api/events/:eventId/attendance
// @access  Private
exports.getEventAttendance = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
        return res.status(404).json({
            success: false,
            error: 'Evento no encontrado'
        });
    }

    const attendances = await Attendance.find({ eventId: req.params.eventId })
        .populate({
            path: 'personId',
            select: 'name credentialNumber dni email'
        })
        .sort('-timestamp');

    res.status(200).json({
        success: true,
        count: attendances.length,
        data: attendances
    });
});



// @desc    Verificar asistencia de una persona
// @route   GET /api/events/:eventId/persons/:personId/attendance
// @access  Public
exports.checkAttendance = asyncHandler(async (req, res) => {
    const { eventId, personId } = req.params;

    // Verificar que el evento y la persona existan
    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({
            success: false,
            error: 'Evento no encontrado'
        });
    }

    const person = await Person.findOne({
        _id: personId,
        eventId: eventId
    });

    if (!person) {
        return res.status(404).json({
            success: false,
            error: 'Persona no encontrada o no asociada a este evento'
        });
    }

    // Verificar si existe un registro de asistencia
    const attendance = await Attendance.findOne({
        eventId: eventId,
        personId: personId
    });

    res.status(200).json({
        success: true,
        data: {
            hasAttended: !!attendance,
            attendanceTime: attendance ? attendance.timestamp : null,
            person: {
                id: person._id,
                name: person.name,
                credentialNumber: person.credentialNumber,
                dni: person.dni
            },
            event: {
                id: event._id,
                name: event.name,
                date: event.date,
                status: event.status
            }
        }
    });
});

// @desc    Eliminar un registro de asistencia
// @route   DELETE /api/attendance/:id
// @access  Private/Admin
exports.deleteAttendance = asyncHandler(async (req, res) => {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
        return res.status(404).json({
            success: false,
            error: 'Registro de asistencia no encontrado'
        });
    }

    await attendance.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Obtener estadísticas de asistencia por evento
// @route   GET /api/events/:eventId/attendance/stats
// @access  Private
exports.getEventAttendanceStats = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
        return res.status(404).json({
            success: false,
            error: 'Evento no encontrado'
        });
    }

    // Total de personas registradas para el evento
    const totalPeople = await Person.countDocuments({ eventId: req.params.eventId });

    // Total de asistencias registradas
    const totalAttendance = await Attendance.countDocuments({ eventId: req.params.eventId });

    // Porcentaje de asistencia
    const attendanceRate = totalPeople > 0 ? (totalAttendance / totalPeople) * 100 : 0;

    // Obtener distribución de asistencias por hora
    const attendanceByHour = await Attendance.aggregate([
        { $match: { eventId: mongoose.Types.ObjectId(req.params.eventId) } },
        {
            $group: {
                _id: { $hour: "$timestamp" },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalPeople,
            totalAttendance,
            attendanceRate: parseFloat(attendanceRate.toFixed(2)),
            attendanceByHour
        }
    });
});