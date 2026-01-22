const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { roles } = require('../utils/constants');
const { getEmails } = require('../controllers/emailsController');

// Get email executions for authenticated user
router.get('/', verifyToken([roles.ADMIN, roles.CLIENT]), getEmails);

module.exports = router;
