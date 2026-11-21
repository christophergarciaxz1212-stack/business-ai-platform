const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const c = require('../controllers/aiController');

const updateSchema = z.object({
  provider: z.string().optional(),
  model: z.string().optional(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  systemPrompt: z.string().optional(),
  personality: z.string().optional(),
  responseLength: z.string().optional(),
  useEmojis: z.boolean().optional(),
  autoTransfer: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
const testSchema = z.object({
  provider: z.string(),
  model: z.string().optional(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
});

router.get('/models', c.listModelsCtrl);
router.get('/config', c.getConfigCtrl);
router.patch('/config', validate(updateSchema), c.updateConfigCtrl);
router.post('/test', validate(testSchema), c.testCtrl);
router.post('/select-best-free', c.selectBestCtrl);

module.exports = router;