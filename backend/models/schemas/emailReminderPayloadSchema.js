const mongoose = require('mongoose');

const emailReminderPayloadSchema = new mongoose.Schema({
	to: {
		type: String,
		required: [true, 'to in the payload is required'],
	},
	subject: {
		type: String,
		required: [true, 'subject in the payload is required'],
	},
	body: {
		type: String,
		required: [true, 'body in the payload is required'],
	},
}, { _id: false });

module.exports = emailReminderPayloadSchema;
