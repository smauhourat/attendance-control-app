const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor ingrese el nombre de la persona'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
    },
    credentialNumber: {
        type: String,
        required: [true, 'Por favor ingrese el número de credencial'],
        trim: true,
        unique: true,
        index: true,
    },
    dni: {
        type: String,
        required: [true, 'Por favor ingrese el DNI'],
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: [true, 'Por favor ingrese el email'],
        trim: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor ingrese un email válido',
        ],
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Debe estar asociado a un evento'],
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Índices compuestos para mejorar rendimiento
PersonSchema.index({ eventId: 1, credentialNumber: 1 });
PersonSchema.index({ eventId: 1, dni: 1 });

module.exports = mongoose.model('Person', PersonSchema);
