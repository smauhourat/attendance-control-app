const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Por favor ingrese el nombre del evento'],
            trim: true,
            maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
        },
        description: {
            type: String,
            required: [true, 'Por favor ingrese una descripción'],
            trim: true,
            maxlength: [500, 'La descripción no puede exceder los 500 caracteres'],
        },
        date: {
            type: Date,
            required: [true, 'Por favor ingrese la fecha del evento'],
        },
        status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open',
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Agregar índices para mejorar el rendimiento en búsquedas
EventSchema.index({ name: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ status: 1 });

// Virtual para acceder a las personas asociadas a este evento
EventSchema.virtual('persons', {
    ref: 'Person',
    localField: '_id',
    foreignField: 'eventId',
    justOne: false,
});

// Virtual para obtener el conteo de asistentes
EventSchema.virtual('attendanceCount', {
    ref: 'Attendance',
    localField: '_id',
    foreignField: 'eventId',
    count: true,
});

module.exports = mongoose.model('Event', EventSchema);
