const { prisma, withTenant } = require('../db');

async function getTenant(tenantId) {
  return prisma.tenant.findUnique({ where: { id: tenantId } });
}

async function updateTenant(tenantId, data) {
  return withTenant(tenantId, (tx) =>
    tx.tenant.update({ where: { id: tenantId }, data })
  );
}

module.exports = { getTenant, updateTenant };