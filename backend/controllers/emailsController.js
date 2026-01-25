const { emailExecutionModel } = require('../models/executionModel');
const { handleError } = require('../utils/errorHandler');

// Get email executions for the authenticated user
const getEmails = async (req, res) => {
	try {
		const userId = req.user.id;
		const { emailType, executionStatus, from, to, limit = 100, skip = 0 } = req.query;

		// Build query filter
		const filter = { userId };

		// Add emailType filter if provided
		if (emailType) {
			filter.emailType = emailType;
		}

		// Add executionStatus filter if provided
		if (executionStatus) {
			filter.executionStatus = executionStatus;
		}

		// Add date range filter if provided (using createdAt from base schema)
		if (from || to) {
			filter.createdAt = {};
			if (from) {
				filter.createdAt.$gte = new Date(from);
			}
			if (to) {
				filter.createdAt.$lte = new Date(to);
			}
		}

		// Fetch email executions with pagination
		const emails = await emailExecutionModel
			.find(filter)
			.select('emailType to subject executionStatus error attempt metadata createdAt')
			.populate('jobId', 'jobType schedule')
			.sort({ createdAt: -1 }) // Most recent first
			.limit(parseInt(limit))
			.skip(parseInt(skip));

		// Get total count for pagination
		const total = await emailExecutionModel.countDocuments(filter);

		res.status(200).send({
			emails,
			pagination: {
				total,
				limit: parseInt(limit),
				skip: parseInt(skip),
				hasMore: total > parseInt(skip) + emails.length,
			},
		});
	} catch (err) {
		console.error(err);
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

module.exports = {
	getEmails,
};
