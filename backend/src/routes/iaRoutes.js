const express = require('express');
const router = express.Router();
const { responder } = require('../controllers/iaController');

router.post('/responder', responder);

module.exports = router;
