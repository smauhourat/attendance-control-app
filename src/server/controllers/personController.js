const Person = require('../models/Person');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Obtener todas las personas
// @route   GET /api/persons
// @access  Public
exports.getPersons = asyncHandler(async (req, res) => {
    let query;

    // Filtrar por evento si se especifica
    if (req.query.eventId) {
        query = Person.find({ eventId: req.query.eventId });
    } else {
        query = Person.find();
    }

    // Filtros adicionales
    if (req.query.name) {
        query = query.find({
            name: { $regex: req.query.name, $options: 'i' }
        });
    }

    if (req.query.dni) {
        query = query.find({ dni: req.query.dni });
    }

    if (req.query.credentialNumber) {
        query = query.find({ credentialNumber: req.query.credentialNumber });
    }

    // Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Person.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Ordenamiento
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('name');
    }

    // Población
    if (req.query.populate) {
        query = query.populate({
            path: 'eventId',
            select: 'name date status'
        });
    }

    // Ejecutar consulta
    const persons = await query;

    // Pagination result
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

    // Agregar información de asistencia para cada persona
    const personsWithAttendance = await Promise.all(persons.map(async (person) => {
        const attendance = await Attendance.findOne({
            eventId: person.eventId,
            personId: person._id
        });

        const personObj = person.toObject();
        personObj.hasAttended = !!attendance;
        personObj.attendanceTime = attendance ? attendance.timestamp : null;

        return personObj;
    }));

    res.status(200).json({
        success: true,
        count: persons.length,
        pagination,
        data: personsWithAttendance
    });
});

// @desc    Obtener una persona
// @route   GET /api/persons/:id
// @access  Public
exports.getPerson = asyncHandler(async (req, res) => {
    const person = await Person.findById(req.params.id).populate({
        path: 'eventId',
        select: 'name date status'
    });

    if (!person) {
        return res.status(404).json({
            success: false,
            error: 'Persona no encontrada'
        });
    }

    const attendance = await Attendance.findOne({
        eventId: person.eventId,
        personId: person._id
    });

    const personObj = person.toObject();
    personObj.hasAttended = !!attendance;
    personObj.attendanceTime = attendance ? attendance.timestamp : null;

    res.status(200).json({
        success: true,
        data: personObj
    });
});

// @desc    Crear una persona
// @route   POST /api/persons
// @access  Private
exports.createPerson = asyncHandler(async (req, res) => {
    // Verificar que el evento exista
    const event = await Event.findById(req.body.eventId);
    if (!event) {
        return res.status(404).json({
            success: false,
            error: 'Evento no encontrado'
        });
    }

    // Verificar que no exista otra persona con el mismo DNI o credencial en el evento
    const existingPerson = await Person.findOne({
        eventId: req.body.eventId,
        $or: [
            { dni: req.body.dni },
            { credentialNumber: req.body.credentialNumber }
        ]
    });

    if (existingPerson) {
        return res.status(400).json({
            success: false,
            error: 'Ya existe una persona con el mismo DNI o número de credencial en este evento'
        });
    }

    const person = await Person.create(req.body);

    res.status(201).json({
        success: true,
        data: person
    });
});

// @desc    Actualizar una persona
// @route   PUT /api/persons/:id
// @access  Private
exports.updatePerson = asyncHandler(async (req, res) => {
    let person = await Person.findById(req.params.id);

    if (!person) {
        return res.status(404).json({
            success: false,
            error: 'Persona no encontrada'
        });
    }

    // Si se intenta cambiar el DNI o credencial, verificar que no exista ya
    if (req.body.dni || req.body.credentialNumber) {
        const existingPerson = await Person.findOne({
            eventId: person.eventId,
            _id: { $ne: person._id },
            $or: [
                { dni: req.body.dni || person.dni },
                { credentialNumber: req.body.credentialNumber || person.credentialNumber }
            ]
        });

        if (existingPerson) {
            return res.status(400).json({
                success: false,
                error: 'Ya existe una persona con el mismo DNI o número de credencial en este evento'
            });
        }
    }

    person = await Person.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: person
    });
});

// @desc    Eliminar una persona
// @route   DELETE /api/persons/:id
// @access  Private
exports.deletePerson = asyncHandler(async (req, res) => {
    const person = await Person.findById(req.params.id);

    if (!person) {
        return res.status(404).json({
            success: false,
            error: 'Persona no encontrada'
        });
    }

    // Verificar si la persona tiene registros de asistencia
    const attendance = await Attendance.findOne({ personId: req.params.id });
    if (attendance) {
        return res.status(400).json({
            success: false,
            error: 'No se puede eliminar una persona con registros de asistencia'
        });
    }

    await person.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Obtener todas las personas de un evento
// @route   GET /api/events/:eventId/persons
// @access  Public
exports.getEventPersons = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
        return res.status(404).json({
            success: false,
            error: 'Evento no encontrado'
        });
    }

    let query = Person.find({ eventId: req.params.eventId });

    // Filtros opcionales
    if (req.query.name) {
        query = query.find({
            name: { $regex: req.query.name, $options: 'i' }
        });
    }

    if (req.query.dni) {
        query = query.find({ dni: req.query.dni });
    }

    if (req.query.credentialNumber) {
        query = query.find({ credentialNumber: req.query.credentialNumber });
    }

    // Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Person.countDocuments({ eventId: req.params.eventId });

    query = query.skip(startIndex).limit(limit);

    // Ordenamiento
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('name');
    }

    // Ejecutar consulta
    const persons = await query;

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

    // Agregar información de asistencia para cada persona
    const personsWithAttendance = await Promise.all(persons.map(async (person) => {
        const attendance = await Attendance.findOne({
            eventId: req.params.eventId,
            personId: person._id
        });

        const personObj = person.toObject();
        personObj.hasAttended = !!attendance;
        personObj.attendanceTime = attendance ? attendance.timestamp : null;

        return personObj;
    }));

    res.status(200).json({
        success: true,
        count: persons.length,
        pagination,
        data: personsWithAttendance
    });
});
