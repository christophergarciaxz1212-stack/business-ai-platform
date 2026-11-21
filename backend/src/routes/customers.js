const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { listCustomers } = require('../services/conversationService');

router.get('/', authMiddleware, async (req, res, next) => {
  try { res.json(await listCustomers(req.tenantId)); } catch (e) { next(e); }
});

module.exports = router;