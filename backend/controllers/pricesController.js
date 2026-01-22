const { storageExecutionModel } = require('../models/executionModel');
const { handleError } = require('../utils/errorHandler');
const { progressStatuses } = require('../utils/constants');

// Get stored prices for the authenticated user
const getPrices = async (req, res) => {
	try {
		const userId = req.user.id;
		const { symbol, from, to, limit = 100, skip = 0 } = req.query;

		// Build query filter
		const filter = {
			userId,
			executionStatus: progressStatuses.SUCCESS, // Only return successful executions
		};

		// Add symbol filter if provided
		if (symbol) {
			filter.symbol = symbol.toUpperCase();
		}

		// Add date range filter if provided
		if (from || to) {
			filter.fetchedAt = {};
			if (from) {
				filter.fetchedAt.$gte = new Date(from);
			}
			if (to) {
				filter.fetchedAt.$lte = new Date(to);
			}
		}

		// Fetch prices with pagination
		const prices = await storageExecutionModel
			.find(filter)
			.select('symbol price currency fetchedAt')
			.sort({ fetchedAt: -1 }) // Most recent first
			.limit(parseInt(limit))
			.skip(parseInt(skip));

		// Get total count for pagination
		const total = await storageExecutionModel.countDocuments(filter);

		res.status(200).send({
			prices,
			pagination: {
				total,
				limit: parseInt(limit),
				skip: parseInt(skip),
				hasMore: total > parseInt(skip) + prices.length,
			},
		});
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

module.exports = {
	getPrices,
};
