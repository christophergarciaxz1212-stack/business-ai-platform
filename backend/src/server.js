require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { config } = require('./config');
const { logger } = require('./logger');
const { globalLimiter } = require('./middleware/rateLimit');
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');
const { tenantContextMiddleware } = require('./middleware/tenantContext');
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(globalLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'BusinessAI-business-ai' }));

app.use('/api/auth', authRoutes);
app.use('/api/tenants', authMiddleware, tenantContextMiddleware, tenantRoutes);

// placeholder routes (implemented in later phases)
app.use('/api/whatsapp', authMiddleware, tenantContextMiddleware, require('./routes/whatsapp'));
app.use('/api/ai', authMiddleware, tenantContextMiddleware, require('./routes/ai'));
app.use('/api/conversations', authMiddleware, tenantContextMiddleware, require('./routes/conversations'));
app.use('/api/knowledge', authMiddleware, tenantContextMiddleware, require('./routes/knowledge'));
app.use('/api/customers', authMiddleware, tenantContextMiddleware, require('./routes/customers'));

app.use(errorHandler);

const server = config.NODE_ENV === 'test' ? null : app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'BusinessAI backend listening');
});

function shutdown() {
  logger.info('shutting down');
  if (server) server.close(() => process.exit(0));
  else process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;