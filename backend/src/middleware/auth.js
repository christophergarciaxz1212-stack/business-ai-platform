const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { logger } = require('../logger');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token não fornecido', code: 'NO_TOKEN' });
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    req.tenantId = payload.tenantId;
    req.role = payload.role;
    next();
  } catch (err) {
    logger.warn({ err: err.message }, 'invalid token');
    return res.status(401).json({ error: 'Token inválido ou expirado', code: 'INVALID_TOKEN' });
  }
}

module.exports = { authMiddleware };