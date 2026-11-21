const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getStats } = require('../services/dashboardService');

router.get('/', authMiddleware, async (req, res, next) => {
  try { res.json(await getStats(req.tenantId)); } catch (e) { next(e); }
});

module.exports = router;