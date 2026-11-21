const { getTenant, updateTenant } = require('../services/tenantService');

async function getMe(req, res, next) {
  try {
    const tenant = await getTenant(req.tenantId);
    if (!tenant) return res.status(404).json({ error: 'Empresa não encontrada', code: 'NOT_FOUND' });
    res.json(tenant);
  } catch (err) { next(err); }
}

async function patchMe(req, res, next) {
  try {
    const tenant = await updateTenant(req.tenantId, req.body);
    res.json(tenant);
  } catch (err) { next(err); }
}

module.exports = { getMe, patchMe };