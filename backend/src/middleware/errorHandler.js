const { ZodError } = require('zod');
const { logger } = require('../logger');

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Dados inválidos', code: 'VALIDATION_ERROR', details: err.flatten().fieldErrors });
  }
  if (err && err.code === 'P2002') {
    return res.status(409).json({ error: 'Registro duplicado', code: 'DUPLICATE' });
  }
  if (err && err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado', code: 'NOT_FOUND' });
  }
  logger.error({ err: err && err.message, stack: err && err.stack }, 'unhandled error');
  const status = (err && err.status) || 500;
  res.status(status).json({ error: (err && err.message) || 'Erro interno', code: 'INTERNAL_ERROR' });
}

module.exports = { errorHandler };