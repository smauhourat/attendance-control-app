const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Debe estar asociado a un evento'],
        index: true,
    },
    personId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
        required: [true, 'Debe estar asociado a una persona'],
        index: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    deviceInfo: {
        type: Object,
        default: {},
    },
});

// Asegurar que una persona solo tenga una asistencia por evento
AttendanceSchema.index({ eventId: 1, personId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
