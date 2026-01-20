const mongoose = require('mongoose');

const emailPricesPayloadSchema = new mongoose.Schema({
	to: {
		type: String,
		required: [true, 'to in the payload is required'],
	},
	symbols: {
		type: [String],
		required: [true, 'symbols in the payload is required'],
	},
}, { _id: false });

module.exports = emailPricesPayloadSchema;
