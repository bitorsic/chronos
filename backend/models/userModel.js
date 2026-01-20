const mongoose = require('mongoose');
const { roles } = require('../utils/constants');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: [true, 'Name should not be less than 2, and more than 100 characters long'],
		minlength: [2, 'Name should not be less than 2, and more than 100 characters long'],
		maxlength: [100, 'Name should not be less than 2, and more than 100 characters long'],
	},
	email: {
		type: String,
		lowercase: true,
		required: [true, 'Please provide a valid email address'],
		unique: [true, 'Email already in use'],
		match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		enum: Object.values(roles),
		default: roles.CLIENT,
		required: [true, 'Role cannot be empty'],
	},
});

module.exports = mongoose.model('users', userSchema);