const express = require('express');
const router = express.Router();
const { getMe, patchMe } = require('../controllers/tenantController');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateTenantSchema } = require('../validators/tenant');

router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, validate(updateTenantSchema), patchMe);

module.exports = router;