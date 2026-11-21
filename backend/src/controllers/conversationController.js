const { listConversations, getMessages, addMessage, takeover } = require('../services/conversationService');

async function listCtrl(req, res, next) {
  try { res.json(await listConversations(req.tenantId)); } catch (e) { next(e); }
}
async function messagesCtrl(req, res, next) {
  try {
    const msgs = await getMessages(req.tenantId, req.params.id);
    if (msgs === null) return res.status(404).json({ error: 'Não encontrada' });
    res.json(msgs);
  } catch (e) { next(e); }
}
async function sendCtrl(req, res, next) {
  try {
    const m = await addMessage(req.tenantId, req.params.id, req.body.content, req.body.role || 'agent');
    if (!m) return res.status(404).json({ error: 'Não encontrada' });
    res.status(201).json(m);
  } catch (e) { next(e); }
}
async function takeoverCtrl(req, res, next) {
  try {
    const c = await takeover(req.tenantId, req.params.id, req.body.active !== false);
    if (!c) return res.status(404).json({ error: 'Não encontrada' });
    res.json(c);
  } catch (e) { next(e); }
}

module.exports = { listCtrl, messagesCtrl, sendCtrl, takeoverCtrl };