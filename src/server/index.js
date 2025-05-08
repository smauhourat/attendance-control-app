// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// Importar rutas
const eventRoutes = require('./routes/events');
const personRoutes = require('./routes/persons');
const attendanceRoutes = require('./routes/attendance');
const authRoutes = require('./routes/auth');

// Configuración
dotenv.config();
const app = express();
//const PORT = process.env.PORT || 5000;
const PORT = 5000

// Middleware
// app.use(cors({
//     origin: process.env.CLIENT_URL || 'http://localhost:3000',
//     credentials: true
// }));

app.use(cors({
    origin: 'http://localhost:5001',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

// Sanitizar datos para prevenir inyección NoSQL
// app.use(mongoSanitize());

// Prevenir XSS (Cross-site scripting)
// app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 100 // límite de 100 peticiones por IP
});
app.use(limiter);

// Prevenir polución de parámetros HTTP
app.use(hpp());

console.log('process.env =>', process.env.MONGO_URI)

// Conexión a MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB conectado'))
    .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Rutas
app.use('/api/events', eventRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Control de Asistencia' });
});

// Manejador de rutas no encontradas
app.use('/{*any}', (req, res) => {
    res.status(404).json({
        success: false,
        error: `La ruta ${req.originalUrl} no existe en este servidor`
    });
});

// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Errores de Mongoose
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Recurso no encontrado'
        });
    }

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            error: message
        });
    }

    // Error de duplicado
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: 'Ya existe un registro con ese valor'
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Error en el servidor'
    });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

// Manejar rechazos de promesas no capturadas
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Cerrar servidor y salir del proceso
    server.close(() => process.exit(1));
});