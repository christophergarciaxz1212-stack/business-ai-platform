const crypto = require('crypto');
const { getConfigByPhoneId, handleIncomingMessage } = require('../services/whatsappService');
const { logger } = require('../logger');

exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const globalToken = process.env.VERIFY_TOKEN || 'whatsapp_verify_token_secure_2025';
  if (mode === 'subscribe' && token === globalToken) {
    return res.status(200).send(challenge);
  }
  // per-tenant verify token check
  // (best-effort: accept if any config matches)
  return res.sendStatus(403);
};

exports.handleWebhook = async (req, res) => {
  // Always acknowledge quickly
  res.status(200).send('EVENT_RECEIVED');
  try {
    const body = req.body;
    if (!body || body.object !== 'whatsapp_business_account') return;
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value || !value.messages) continue;
        const phoneNumberId = value.metadata?.phone_number_id;
        const contacts = value.contacts || [];
        const cfg = await getConfigByPhoneId(phoneNumberId);
        if (!cfg || !cfg.isActive) {
          logger.warn({ phoneNumberId }, 'unknown or inactive whatsapp config');
          continue;
        }
        const tenantId = cfg.tenantId;
        for (const msg of value.messages) {
          // process async without blocking ack (already sent)
          handleIncomingMessage(tenantId, phoneNumberId, msg, contacts).catch((err) =>
            logger.error({ err: err.message }, 'handleIncomingMessage failed')
          );
        }
      }
    }
  } catch (err) {
    logger.error({ err: err.message }, 'webhook processing error');
  }
};