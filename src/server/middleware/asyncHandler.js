/**
 * Middleware para manejar excepciones asíncronas
 * Elimina la necesidad de usar try/catch en cada controlador
 * @param {Function} fn Función async del controlador
 * @returns {Function} Función envuelta que maneja errores
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;