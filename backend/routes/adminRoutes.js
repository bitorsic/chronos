const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { roles } = require('../utils/constants');
const {
	getJobsReport,
	getEmailsReport,
	getPricesReport,
} = require('../controllers/adminReportsController');

// Admin-only report endpoints
router.get('/reports/jobs', verifyToken([roles.ADMIN]), getJobsReport);
router.get('/reports/emails', verifyToken([roles.ADMIN]), getEmailsReport);
router.get('/reports/prices', verifyToken([roles.ADMIN]), getPricesReport);

module.exports = router;
