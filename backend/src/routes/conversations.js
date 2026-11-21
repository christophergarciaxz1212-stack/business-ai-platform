const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const c = require('../controllers/conversationController');

router.get('/', authMiddleware, c.listCtrl);
router.get('/:id/messages', authMiddleware, c.messagesCtrl);
router.post('/:id/messages', authMiddleware, validate(z.object({ content: z.string().min(1), role: z.string().optional() })), c.sendCtrl);
router.post('/:id/takeover', authMiddleware, validate(z.object({ active: z.boolean().optional() })), c.takeoverCtrl);

module.exports = router;