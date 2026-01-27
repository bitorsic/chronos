const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { roles } = require('../utils/constants');
const {
	createEmailReminderJob,
	createEmailPricesJob,
	createStorePricesJob,
	getJobs,
	getJobById,
	deleteJob,
	getExecutions,
	getExecutionById,
	getJobPrices,
	getJobEmails,
} = require('../controllers/jobController');

// Job creation routes (authenticated users only)
router.post('/email-reminder', verifyToken([roles.ADMIN, roles.CLIENT]), createEmailReminderJob);
router.post('/email-prices', verifyToken([roles.ADMIN, roles.CLIENT]), createEmailPricesJob);
router.post('/store-prices', verifyToken([roles.ADMIN, roles.CLIENT]), createStorePricesJob);

// Job management routes
router.get('/', verifyToken([roles.ADMIN, roles.CLIENT]), getJobs);
router.get('/:jobId', verifyToken([roles.ADMIN, roles.CLIENT]), getJobById);
router.get('/:jobId/prices', verifyToken([roles.ADMIN, roles.CLIENT]), getJobPrices);
router.get('/:jobId/emails', verifyToken([roles.ADMIN, roles.CLIENT]), getJobEmails);
router.delete('/:jobId', verifyToken([roles.ADMIN, roles.CLIENT]), deleteJob);

// Execution routes
router.get('/executions/all', verifyToken([roles.ADMIN, roles.CLIENT]), getExecutions);
router.get('/executions/:executionId', verifyToken([roles.ADMIN, roles.CLIENT]), getExecutionById);

module.exports = router;
