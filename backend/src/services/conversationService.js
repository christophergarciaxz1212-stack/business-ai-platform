const { prisma } = require('../db');

async function listConversations(tenantId) {
  return prisma.conversation.findMany({
    where: { tenantId },
    include: { customer: true },
    orderBy: { lastMessageAt: 'desc' },
    take: 100,
  });
}
async function getMessages(tenantId, conversationId) {
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, tenantId } });
  if (!conv) return null;
  return prisma.message.findMany({ where: { conversationId, tenantId }, orderBy: { createdAt: 'asc' } });
}
async function addMessage(tenantId, conversationId, content, role) {
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, tenantId } });
  if (!conv) return null;
  return prisma.message.create({ data: { tenantId, conversationId, role, content } });
}
async function takeover(tenantId, conversationId, active) {
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, tenantId } });
  if (!conv) return null;
  return prisma.conversation.update({ where: { id: conversationId }, data: { humanTakeover: active } });
}
async function listCustomers(tenantId) {
  return prisma.customer.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
}

module.exports = { listConversations, getMessages, addMessage, takeover, listCustomers };