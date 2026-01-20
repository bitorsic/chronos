const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { roles } = require('../utils/constants');
const {
	createUser,
	getAllAdmins,
	getAllClients,
	login,
	refreshToken,
	forgotPassword,
	resetPassword,
	editUser,
	getUserInfo,
} = require('../controllers/userController');

// Public routes
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Admin only routes
router.post('/users', verifyToken(), createUser); // Create admin or client
router.get('/admins', verifyToken(), getAllAdmins);
router.get('/clients', verifyToken(), getAllClients);

// Authenticated user routes (both admin and client)
router.put('/me', verifyToken([roles.ADMIN, roles.CLIENT]), editUser);
router.get('/me', verifyToken([roles.ADMIN, roles.CLIENT]), getUserInfo);

module.exports = router;
