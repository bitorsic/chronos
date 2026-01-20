const mongoose = require('mongoose');

const metadataItemSchema = new mongoose.Schema({
	symbol: {
		type: String,
		required: [true, 'symbol in the metadata is required'],
	},
	price: {
		type: Number,
		required: [true, 'price in the metadata is required'],
	},
}, { _id: false });

module.exports = metadataItemSchema;
