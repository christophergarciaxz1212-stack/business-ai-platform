const { register, login, refresh } = require('../services/authService');
const { config } = require('../config');

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function registerCtrl(req, res, next) {
  try {
    const { email, password, name, companyName } = req.body;
    const result = await register({ email, password, name, companyName });
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({ user: result.user, tenant: result.tenant, accessToken: result.accessToken });
  } catch (err) { next(err); }
}

async function loginCtrl(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    setRefreshCookie(res, result.refreshToken);
    res.json({ user: result.user, tenantId: result.tenantId, role: result.role, accessToken: result.accessToken });
  } catch (err) { next(err); }
}

async function refreshCtrl(req, res, next) {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token ausente', code: 'NO_REFRESH' });
    const result = refresh(token);
    res.json(result);
  } catch (err) { next(err); }
}

async function logoutCtrl(req, res) {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.status(204).send();
}

module.exports = { registerCtrl, loginCtrl, refreshCtrl, logoutCtrl };