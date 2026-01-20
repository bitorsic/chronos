const mongoose = require('mongoose');
const { jobTypes, progressStatuses } = require('../utils/constants');
const scheduleSchema = require('./schemas/scheduleSchema');
const storePricePayloadSchema = require('./schemas/storePricePayloadSchema');
const emailReminderPayloadSchema = require('./schemas/emailReminderPayloadSchema');
const emailPricesPayloadSchema = require('./schemas/emailPricesPayloadSchema');
const ObjectId = mongoose.Schema.Types.ObjectId;

const jobSchema = new mongoose.Schema({
	userId: {
		type: ObjectId,
		ref: 'users',
		required: [true, 'Could not assign job to the user'],
	},
	schedule: {
		type: scheduleSchema,
		required: [true, 'Could not set the schedule for the job'],
	},
	lastRunAt: {
		type: Date,
	},
	lastRunStatus: {
		type: String,
		enum: Object.values(progressStatuses),
	},
}, { discriminatorKey: 'jobType' });

const jobModel = mongoose.model('jobs', jobSchema);

// Discriminators for each job type with their specific payload schemas
const storePricesJobModel = jobModel.discriminator(jobTypes.STORE_PRICES, new mongoose.Schema({
	payload: {
		type: storePricePayloadSchema,
		required: [true, 'Payload is required for store prices job'],
	},
}));

const emailReminderJobModel = jobModel.discriminator(jobTypes.EMAIL_REMINDER, new mongoose.Schema({
	payload: {
		type: emailReminderPayloadSchema,
		required: [true, 'Payload is required for email reminder job'],
	},
}));

const emailPricesJobModel = jobModel.discriminator(jobTypes.EMAIL_PRICES, new mongoose.Schema({
	payload: {
		type: emailPricesPayloadSchema,
		required: [true, 'Payload is required for email prices job'],
	},
}));

module.exports = { jobModel, storePricesJobModel, emailReminderJobModel, emailPricesJobModel };