const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma, withTenant } = require('../db');
const { config } = require('../config');
const { logger } = require('../logger');

const SALT_ROUNDS = 12;

function slugify(name) {
  return String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'tenant';
}

async function uniqueSlug(base) {
  let slug = base;
  let i = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (!existing) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

function signAccessToken(user, tenantId, role) {
  return jwt.sign(
    { sub: user.id, email: user.email, tenantId, role },
    config.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function signRefreshToken(user, tenantId, role) {
  return jwt.sign(
    { sub: user.id, email: user.email, tenantId, role, type: 'refresh' },
    config.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

async function register({ email, password, name, companyName }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email já cadastrado');
    err.status = 409;
    err.code = 'DUPLICATE_EMAIL';
    throw err;
  }
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { email, password: hash, name } });

  const baseSlug = slugify(companyName || name);
  const slug = await uniqueSlug(baseSlug);
  const tenant = await prisma.tenant.create({
    data: { slug, companyName: companyName || name },
  });
  await prisma.tenantMember.create({
    data: { userId: user.id, tenantId: tenant.id, role: 'owner' },
  });
  await prisma.aiConfig.create({ data: { tenantId: tenant.id } });

  const accessToken = signAccessToken(user, tenant.id, 'owner');
  const refreshToken = signRefreshToken(user, tenant.id, 'owner');
  return { user: { id: user.id, email: user.email, name: user.name }, tenant, accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error('Credenciais inválidas');
    err.status = 401;
    throw err;
  }
  // pick first membership (owner preferred)
  const membership = await prisma.tenantMember.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  });
  if (!membership) {
    const err = new Error('Usuário sem empresa vinculada');
    err.status = 403;
    throw err;
  }
  const accessToken = signAccessToken(user, membership.tenantId, membership.role);
  const refreshToken = signRefreshToken(user, membership.tenantId, membership.role);
  return { user: { id: user.id, email: user.email, name: user.name }, tenantId: membership.tenantId, role: membership.role, accessToken, refreshToken };
}

function refresh(refreshTokenStr) {
  let payload;
  try {
    payload = jwt.verify(refreshTokenStr, config.JWT_REFRESH_SECRET);
  } catch (err) {
    const e = new Error('Refresh token inválido');
    e.status = 401;
    throw e;
  }
  if (payload.type !== 'refresh') {
    const e = new Error('Token inválido');
    e.status = 401;
    throw e;
  }
  const accessToken = signAccessToken({ id: payload.sub, email: payload.email }, payload.tenantId, payload.role);
  return { accessToken };
}

module.exports = { register, login, refresh, signAccessToken, signRefreshToken };