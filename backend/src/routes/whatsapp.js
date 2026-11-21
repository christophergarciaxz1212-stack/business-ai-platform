const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const { prisma } = require('../db');
const { encrypt } = require('../crypto');
const webhookController = require('../controllers/webhookController');

// public webhook endpoints (Meta calls these)
router.get('/webhook', webhookController.verifyWebhook);
router.post('/webhook', webhookController.handleWebhook);

// protected config endpoints
router.get('/config', authMiddleware, async (req, res, next) => {
  try {
    const cfg = await prisma.whatsAppConfig.findFirst({ where: { tenantId: req.tenantId } });
    if (!cfg) return res.json(null);
    const { accessTokenEnc, appSecretEnc, ...rest } = cfg;
    res.json({ ...rest, hasToken: !!accessTokenEnc });
  } catch (e) { next(e); }
});
router.post('/config', authMiddleware, validate(z.object({
  phoneNumberId: z.string().min(1),
  accessToken: z.string().min(1),
  appSecret: z.string().optional(),
  verifyToken: z.string().optional(),
  wabaId: z.string().optional(),
})), async (req, res, next) => {
  try {
    const { phoneNumberId, accessToken, appSecret, verifyToken, wabaId } = req.body;
    const cfg = await prisma.whatsAppConfig.upsert({
      where: { phoneNumberId },
      create: {
        tenantId: req.tenantId, phoneNumberId, accessTokenEnc: encrypt(accessToken),
        appSecretEnc: appSecret ? encrypt(appSecret) : null, verifyToken, wabaId, isActive: true,
      },
      update: {
        tenantId: req.tenantId, accessTokenEnc: encrypt(accessToken),
        appSecretEnc: appSecret ? encrypt(appSecret) : null, verifyToken, wabaId, isActive: true,
      },
    });
    const { accessTokenEnc, appSecretEnc, ...rest } = cfg;
    res.json({ ...rest, hasToken: true });
  } catch (e) { next(e); }
});
router.get('/webhook-info', authMiddleware, async (req, res) => {
  const url = `${process.env.PUBLIC_URL || 'https://seu-tunel.trycloudflare.com'}/api/whatsapp/webhook`;
  const cfg = await prisma.whatsAppConfig.findFirst({ where: { tenantId: req.tenantId } });
  res.json({ url, verifyToken: cfg?.verifyToken || process.env.VERIFY_TOKEN || 'whatsapp_verify_token_secure_2025' });
});

module.exports = router;