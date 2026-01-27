const mongoose = require('mongoose');

const metadataItemSchema = new mongoose.Schema({
	symbol: {
		type: String,
		required: [true, 'symbol in the metadata is required'],
	},
	price: {
		type: Number,
	},
	currency: {
		type: String,
	},
}, { _id: false });

module.exports = metadataItemSchema;
