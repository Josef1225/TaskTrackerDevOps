const express = require('express');
const { sendEmailController } = require('../controllers/emailController');

const router = express.Router();

// POST /api/email/send
router.post('/send', sendEmailController);

module.exports = router;