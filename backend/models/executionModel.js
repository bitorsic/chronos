const mongoose = require('mongoose');
const { progressStatuses, executionTypes, emailTypes } = require('../utils/constants');
const metadataItemSchema = require('./schemas/metadataItemSchema');
const ObjectId = mongoose.Schema.Types.ObjectId;

const executionSchema = new mongoose.Schema({
	userId: {
		type: ObjectId,
		ref: 'users',
		required: [true, 'Could not assign execution to the user'],
	},
	jobId: {
		type: ObjectId,
		ref: 'jobs',
		required: [true, 'Could not assign execution to the job'],
	},
	executionStatus: {
		type: String,
		enum: Object.values(progressStatuses),
		required: [true, 'Execution status is required'],
	},
	error: {
		type: String,
	},
	attempt: {
		type: Number,
		required: [true, 'Attempt number is required'],
	},
}, { discriminatorKey: 'type' });

const executionModel = mongoose.model('executions', executionSchema);

// Discriminators for each execution type
const storageExecutionModel = executionModel.discriminator(executionTypes.STORAGE, new mongoose.Schema({
	symbol: {
		type: String,
		required: [true, 'symbol is required for storage execution'],
	},
	price: {
		type: Number,
		required: [true, 'price is required for storage execution'],
	},
	currency: {
		type: String,
		required: [true, 'currency is required for storage execution'],
	},
	fetchedAt: {
		type: Date,
		required: [true, 'fetchedAt is required for storage execution'],
	},
}));

const emailExecutionModel = executionModel.discriminator(executionTypes.EMAIL, new mongoose.Schema({
	emailType: {
		type: String,
		enum: Object.values(emailTypes),
		required: [true, 'emailType is required for email execution'],
	},
	to: {
		type: String,
		required: [true, 'to is required for email execution'],
	},
	subject: {
		type: String,
		required: [true, 'subject is required for email execution'],
	},
	metadata: {
		type: [metadataItemSchema],
		validate: {
			validator: function (v) {
				if (this.emailType === emailTypes.PRICES) return v != null && v.length > 0;
				return v == null || v.length === 0;
			},
			message: `metadata field must be set only when the emailType is "${emailTypes.PRICES}"`,
		},
	},
}));

module.exports = { executionModel, storageExecutionModel, emailExecutionModel };
