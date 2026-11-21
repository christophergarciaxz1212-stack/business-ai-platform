const { listDocs, addDoc } = require('../services/knowledgeService');
const { listCustomers } = require('../services/conversationService');

async function listDocsCtrl(req, res, next) {
  try { res.json(await listDocs(req.tenantId)); } catch (e) { next(e); }
}
async function addDocCtrl(req, res, next) {
  try {
    const doc = await addDoc(req.tenantId, req.body.title, req.body.content);
    res.status(201).json(doc);
  } catch (e) { next(e); }
}
async function listCustomersCtrl(req, res, next) {
  try { res.json(await listCustomers(req.tenantId)); } catch (e) { next(e); }
}

module.exports = { listDocsCtrl, addDocCtrl, listCustomersCtrl };