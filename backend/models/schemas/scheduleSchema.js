const mongoose = require('mongoose');
const { scheduleTypes } = require('../../utils/constants');

const scheduleSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: Object.values(scheduleTypes),
		required: [true, 'Could not set the schedule type'],
	},
	timestamp: {
		type: Date,
		validate: {
			validator: function (v) {
				if (this.type === scheduleTypes.ONCE) return v != null;
				return v == null;
			}, 
			message: `timestamp field must be set only when the schedule type is "${scheduleTypes.ONCE}"`,
		},
	},
	cronExpression: {
		type: String,
		validate: {
			validator: function (v) {
				if (this.type === scheduleTypes.CRON) return v != null;
				return v == null;
			}, 
			message: `cronExpression field must be set only when the schedule type is "${scheduleTypes.CRON}"`,
		},
	},
}, { _id: false });

module.exports = scheduleSchema;