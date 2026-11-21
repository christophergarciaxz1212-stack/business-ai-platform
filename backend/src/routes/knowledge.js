const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const c = require('../controllers/knowledgeController');

router.get('/docs', authMiddleware, c.listDocsCtrl);
router.post('/docs', authMiddleware, validate(z.object({ title: z.string().min(1), content: z.string().min(1) })), c.addDocCtrl);
router.get('/customers', authMiddleware, c.listCustomersCtrl);

module.exports = router;