const mongoose = require('mongoose');

const storePricePayloadSchema = new mongoose.Schema({
	symbol: {
		type: String,
		required: [true, 'symbol in the payload is required'],
	},
}, { _id: false });

module.exports = storePricePayloadSchema;
