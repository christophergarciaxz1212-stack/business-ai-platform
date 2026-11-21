const { prisma, withTenant } = require('../db');
const { decrypt } = require('../crypto');
const { logger } = require('../logger');
const axios = require('axios');

const GRAPH_VERSION = 'v20.0';

async function getConfigByPhoneId(phoneNumberId) {
  return prisma.whatsAppConfig.findUnique({ where: { phoneNumberId } });
}

async function sendTextMessage({ phoneNumberId, accessToken, to, text }) {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;
  const res = await axios.post(url, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  }, { headers: { Authorization: `Bearer ${accessToken}` }, timeout: 30000 });
  return res.data;
}

async function handleIncomingMessage(tenantId, phoneNumberId, msg, contacts) {
  const from = msg.from;
  const messageId = msg.id;
  // idempotency
  const existing = await prisma.message.findUnique({ where: { externalId: messageId } });
  if (existing) return;

  // get or create customer
  let customer = await prisma.customer.findUnique({ where: { tenantId_phone: { tenantId, phone: from } } }).catch(() => null);
  if (!customer) {
    customer = await prisma.customer.create({ data: { tenantId, phone: from, name: contacts?.[0]?.profile?.name || '' } });
  }
  // get or create conversation
  let conversation = await prisma.conversation.findFirst({ where: { tenantId, customerId: customer.id, status: 'open' } });
  if (!conversation) {
    conversation = await prisma.conversation.create({ data: { tenantId, customerId: customer.id } });
  }

  // store incoming message
  await prisma.message.create({
    data: { tenantId, conversationId: conversation.id, role: 'customer', content: msg.text?.body || `[${msg.type}]`, externalId: messageId, mediaType: msg.type !== 'text' ? msg.type : null },
  });

  // if human takeover, do not reply
  if (conversation.humanTakeover) {
    await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } });
    return;
  }

  // check working hours
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const aiCfg = await prisma.aiConfig.findUnique({ where: { tenantId } });
  if (!aiCfg || !aiCfg.isActive) return;

  // generate reply
  const { generateReply } = require('./aiService');
  let replyText = 'Desculpe, não consegui processar sua mensagem agora.';
  try {
    const r = await generateReply({ tenantId, conversationId: conversation.id, customerMessage: msg.text?.body || '', mediaType: msg.type !== 'text' ? msg.type : null });
    replyText = r.reply;
  } catch (err) {
    logger.error({ err: err.message }, 'ai generation failed');
  }

  // store + send reply
  await prisma.message.create({ data: { tenantId, conversationId: conversation.id, role: 'assistant', content: replyText } });
  const cfg = await prisma.whatsAppConfig.findUnique({ where: { phoneNumberId } });
  const accessToken = decrypt(cfg.accessTokenEnc);
  try {
    await sendTextMessage({ phoneNumberId, accessToken, to: from, text: replyText });
  } catch (err) {
    logger.error({ err: err.message }, 'send message failed');
  }
  await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } });
}

module.exports = { getConfigByPhoneId, handleIncomingMessage, sendTextMessage };