const express = require('express');
const router = express.Router();
const { registerCtrl, loginCtrl, refreshCtrl, logoutCtrl } = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, validate(registerSchema), registerCtrl);
router.post('/login', authLimiter, validate(loginSchema), loginCtrl);
router.post('/refresh', refreshCtrl);
router.post('/logout', logoutCtrl);

module.exports = router;