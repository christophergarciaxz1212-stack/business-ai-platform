// Tenant context is attached by authMiddleware (req.tenantId).
// RLS is enforced via withTenant() in services. This middleware is kept
// for explicitness and future per-request overrides.
function tenantContextMiddleware(req, res, next) {
  return next();
}

module.exports = { tenantContextMiddleware };