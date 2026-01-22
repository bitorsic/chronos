const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { roles } = require('../utils/constants');
const { getPrices } = require('../controllers/pricesController');

// Get stored prices for authenticated user
router.get('/', verifyToken([roles.ADMIN, roles.CLIENT]), getPrices);

module.exports = router;
