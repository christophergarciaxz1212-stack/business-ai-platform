const { logger } = require('./logger');

let prisma;
let withTenant;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
  const { PrismaClient } = require('../generated/sqlite-client');
  prisma = new PrismaClient();
  withTenant = async (tenantId, fn) => prisma.$transaction(async (tx) => fn(tx));
} else {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient({ log: [{ emit: 'event', level: 'error' }] });
  prisma.$on('error', (e) => logger.error(e, 'prisma error'));
  withTenant = async (tenantId, fn) => {
    return prisma.$transaction(async (tx) => {
      if (tenantId) await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
      return fn(tx);
    });
  };
}

async function shutdown() {
  await prisma.$disconnect();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = { prisma, withTenant, shutdown };