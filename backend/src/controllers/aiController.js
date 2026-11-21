const { listModels, testProvider, selectBestFree, getAiConfig } = require('../services/aiService');
const { prisma } = require('../db');
const { encrypt } = require('../crypto');

async function listModelsCtrl(req, res, next) {
  try { res.json(await listModels()); } catch (e) { next(e); }
}
async function getConfigCtrl(req, res, next) {
  try {
    const cfg = await getAiConfig(req.tenantId);
    if (!cfg) return res.json(null);
    const { apiKeyEnc, ...rest } = cfg;
    res.json({ ...rest, hasKey: !!apiKeyEnc });
  } catch (e) { next(e); }
}
async function updateConfigCtrl(req, res, next) {
  try {
    const { provider, model, apiKey, baseUrl, systemPrompt, personality, responseLength, useEmojis, autoTransfer, isActive } = req.body;
    const data = { provider, model, baseUrl, systemPrompt, personality, responseLength, useEmojis, autoTransfer, isActive };
    if (apiKey) data.apiKeyEnc = encrypt(apiKey);
    const cfg = await prisma.aiConfig.upsert({
      where: { tenantId: req.tenantId },
      create: { tenantId: req.tenantId, ...data },
      update: data,
    });
    const { apiKeyEnc, ...rest } = cfg;
    res.json({ ...rest, hasKey: !!apiKeyEnc });
  } catch (e) { next(e); }
}
async function testCtrl(req, res, next) {
  try {
    const { provider, model, apiKey, baseUrl } = req.body;
    const r = await testProvider({ provider, model, apiKey, baseUrl });
    res.json(r);
  } catch (e) { next(e); }
}
async function selectBestCtrl(req, res, next) {
  try {
    const chosen = await selectBestFree(req.tenantId);
    res.json({ model: chosen.id, provider: chosen.provider, name: chosen.name });
  } catch (e) { next(e); }
}

module.exports = { listModelsCtrl, getConfigCtrl, updateConfigCtrl, testCtrl, selectBestCtrl };