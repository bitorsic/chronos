const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { roles } = require('../utils/constants');
const {
	createEmailReminderJob,
	createEmailPricesJob,
	createStorePricesJob,
} = require('../controllers/jobController');

// Job creation routes (authenticated users only)
router.post('/email-reminder', verifyToken([roles.ADMIN, roles.CLIENT]), createEmailReminderJob);
router.post('/email-prices', verifyToken([roles.ADMIN, roles.CLIENT]), createEmailPricesJob);
router.post('/store-prices', verifyToken([roles.ADMIN, roles.CLIENT]), createStorePricesJob);

module.exports = router;
