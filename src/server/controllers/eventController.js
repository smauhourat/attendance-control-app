const Event = require('../models/Event');
const Person = require('../models/Person');
const Attendance = require('../models/Attendance');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Obtener todos los eventos
// @route   GET /api/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     success: true,
    //     count: 0,
    //     data: ''
    // });

    // return;

    // Permitir filtrado, paginación y ordenamiento
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
    query = Event.find(JSON.parse(queryStr));

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
        query = query.sort('-date');
    }

    // Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Event.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Ejecutar consulta
    const events = await query;

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

    // Agregar conteos de personas y asistencias
    const eventsWithCounts = await Promise.all(events.map(async (event) => {
        const totalPeople = await Person.countDocuments({ eventId: event._id });
        const attendanceCount = await Attendance.countDocuments({ eventId: event._id });

        const eventObj = event.toObject();
        eventObj.totalPeople = totalPeople;
        eventObj.attendanceCount = attendanceCount;

        return eventObj;
    }));

    res.status(200).json({
        success: true,
        count: events.length,
        pagination,
        data: eventsWithCounts
    });
});

// @desc    Obtener un solo evento
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return res.status(404).json({
            success: false,
            error: 'Evento no encontrado'
        });
    }

    const totalPeople = await Person.countDocuments({ eventId: event._id });
    const attendanceCount = await Attendance.countDocuments({ eventId: event._id });

    const eventObj = event.toObject();
    eventObj.totalPeople = totalPeople;
    eventObj.attendanceCount = attendanceCount;

    res.status(200).json({
        success: true,
        data: eventObj
    });
});

// @desc    Crear un evento
// @route   POST /api/events
// @access  Private
exports.createEvent = asyncHandler(async (req, res) => {
    const event = await Event.create(req.body);

    res.status(201).json({
        success: true,
        data: event
    });
});

// @desc    Actualizar un evento
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = asyncHandler(async (req, res) => {
    let event = await Event.findById(req.params.id);

    if (!event) {
        return res.status(404).json({
            success: false,
            error: 'Evento no encontrado'
        });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: event
    });
});

// @desc    Eliminar un evento
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return res.status(404).json({
            success: false,
            error: 'Evento no encontrado'
        });
    }

    // Verificar si hay personas asociadas al evento
    const personsCount = await Person.countDocuments({ eventId: req.params.id });
    if (personsCount > 0) {
        return res.status(400).json({
            success: false,
            error: 'No se puede eliminar un evento con personas asociadas'
        });
    }

    await event.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});
