const { prisma } = require('../db');

async function getStats(tenantId) {
  const [conversations, customers, messages, pending, transferred] = await Promise.all([
    prisma.conversation.count({ where: { tenantId } }),
    prisma.customer.count({ where: { tenantId } }),
    prisma.message.count({ where: { tenantId } }),
    prisma.conversation.count({ where: { tenantId, status: 'open' } }),
    prisma.conversation.count({ where: { tenantId, humanTakeover: true } }),
  ]);
  return { conversations, customers, messages, pending, transferred, avgResponse: '—' };
}

module.exports = { getStats };