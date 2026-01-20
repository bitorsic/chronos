const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { roles, emailTemplates } = require('../utils/constants');
const { generateSecurePassword } = require('../utils/helpers');
const { sendEmail } = require('../services/nodemailerService');
const { handleError } = require('../utils/errorHandler');

// Create user (admin or client, only admins can do this)
const createUser = async (req, res) => {
	try {
		const { name, email, role } = req.body;

		// Generate random password
		const password = generateSecurePassword();
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await userModel.create({
			name,
			email,
			password: hashedPassword,
			role,
		});

		// Send email with credentials
		const emailContent = emailTemplates.USER_REGISTRATION(name, email, password, role);
		await sendEmail(email, emailContent.subject, emailContent.body);

		res.status(201).send({
			message: `${role === roles.ADMIN ? 'Admin' : 'Client'} created successfully`,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			temporaryPassword: password, // Send in response as backup
		});
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Get all admins (only admins can do this)
const getAllAdmins = async (req, res) => {
	try {
		const admins = await userModel.find({ role: roles.ADMIN }).select('-password');
		res.status(200).send({ admins });
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// List all clients (only admins can do this)
const getAllClients = async (req, res) => {
	try {
		const clients = await userModel.find({ role: roles.CLIENT }).select('-password');
		res.status(200).send({ clients });
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Login endpoint
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await userModel.findOne({ email });
		if (!user) {
			return res.status(401).send({ message: 'Invalid credentials' });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).send({ message: 'Invalid credentials' });
		}

		// Generate access token
		const accessToken = jwt.sign(
			{ sub: user._id, role: user.role },
			process.env.AUTH_TOKEN_SECRET,
			{ expiresIn: '15m', issuer: process.env.JWT_ISSUER }
		);

		// Generate refresh token
		const refreshToken = jwt.sign(
			{ sub: user._id, role: user.role },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: '7d', issuer: process.env.JWT_ISSUER }
		);

		res.status(200).send({
			message: 'Login successful',
			accessToken,
			refreshToken,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Refresh token endpoint
const refreshToken = async (req, res) => {
	try {
		const { refreshToken } = req.body;

		const { sub, role, iss } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

		if (iss !== process.env.JWT_ISSUER) {
			return res.status(401).send({ message: 'JWT issuer different than expected' });
		}

		// Generate new access token
		const accessToken = jwt.sign(
			{ sub, role },
			process.env.AUTH_TOKEN_SECRET,
			{ expiresIn: '15m', issuer: process.env.JWT_ISSUER }
		);

		res.status(200).send({
			message: 'Token refreshed successfully',
			accessToken,
		});
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Forgot password - generate reset token
const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		const user = await userModel.findOne({ email });
		if (!user) {
			// Don't reveal if user exists or not
			return res.status(200).send({ message: 'If the email exists, a password reset token has been generated' });
		}

		// Generate password reset token (valid for 1 hour)
		const resetToken = jwt.sign(
			{ sub: user._id },
			process.env.FORGOT_PASSWORD_SECRET,
			{ expiresIn: '1h', issuer: process.env.JWT_ISSUER }
		);

		// TODO: Send email with reset token
		// For now, just return it in response (in production, this should be sent via email)
		res.status(200).send({
			message: 'Password reset token generated',
			resetToken, // In production, don't send this in response, send via email
		});
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Reset password using token
const resetPassword = async (req, res) => {
	try {
		const { resetToken, newPassword } = req.body;

		const { sub, iss } = jwt.verify(resetToken, process.env.FORGOT_PASSWORD_SECRET);

		if (iss !== process.env.JWT_ISSUER) {
			return res.status(401).send({ message: 'JWT issuer different than expected' });
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await userModel.findByIdAndUpdate(sub, { password: hashedPassword });

		res.status(200).send({ message: 'Password reset successfully' });
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Edit user (including change password)
const editUser = async (req, res) => {
	try {
		const { name, email, oldPassword, newPassword } = req.body;
		const userId = req.user.id;

		const user = await userModel.findById(userId);
		if (!user) {
			return res.status(404).send({ message: 'User not found' });
		}

		// If changing password, verify old password
		if (newPassword) {
			if (!oldPassword) {
				return res.status(400).send({ message: 'oldPassword is required to change password' });
			}

			const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
			if (!isPasswordValid) {
				return res.status(401).send({ message: 'Old password is incorrect' });
			}

			user.password = await bcrypt.hash(newPassword, 10);
		}

		// Update other fields
		if (name) user.name = name;
		if (email) user.email = email;

		await user.save();

		res.status(200).send({
			message: 'User updated successfully',
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Get user info (of signed-in user)
const getUserInfo = async (req, res) => {
	try {
		const userId = req.user.id;

		const user = await userModel.findById(userId).select('-password');
		if (!user) {
			return res.status(404).send({ message: 'User not found' });
		}

		res.status(200).send({ user });
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

module.exports = {
	createUser,
	getAllAdmins,
	getAllClients,
	login,
	refreshToken,
	forgotPassword,
	resetPassword,
	editUser,
	getUserInfo,
};
