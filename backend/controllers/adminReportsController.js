const { jobModel } = require('../models/jobModel');
const { emailExecutionModel, storageExecutionModel } = require('../models/executionModel');
const { handleError } = require('../utils/errorHandler');
const { progressStatuses } = require('../utils/constants');

// Get job counts grouped by job type and user
const getJobsReport = async (req, res) => {
	try {
		const totalJobs = await jobModel.countDocuments();
		
		// Jobs by type
		const byType = await jobModel.aggregate([
			{
				$group: {
					_id: '$jobType',
					count: { $sum: 1 },
				},
			},
		]);

		// Jobs per user
		const byUser = await jobModel.aggregate([
			{
				$group: {
					_id: '$userId',
					count: { $sum: 1 },
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'user',
				},
			},
			{
				$unwind: '$user',
			},
			{
				$project: {
					_id: 1,
					email: '$user.email',
					name: '$user.name',
					count: 1,
				},
			},
			{
				$sort: { count: -1 },
			},
		]);

		res.status(200).send({
			totalJobs,
			byType,
			byUser,
		});
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Get email delivery counts and failure statistics per user
const getEmailsReport = async (req, res) => {
	try {
		const totalEmails = await emailExecutionModel.countDocuments();
		const successful = await emailExecutionModel.countDocuments({ executionStatus: progressStatuses.SUCCESS });
		const failed = await emailExecutionModel.countDocuments({ executionStatus: progressStatuses.FAILURE });

		// Emails per user
		const byUser = await emailExecutionModel.aggregate([
			{
				$group: {
					_id: '$userId',
					total: { $sum: 1 },
					successful: {
						$sum: { $cond: [{ $eq: ['$executionStatus', progressStatuses.SUCCESS] }, 1, 0] },
					},
					failed: {
						$sum: { $cond: [{ $eq: ['$executionStatus', progressStatuses.FAILURE] }, 1, 0] },
					},
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'user',
				},
			},
			{
				$unwind: '$user',
			},
			{
				$project: {
					_id: 1,
					email: '$user.email',
					name: '$user.name',
					total: 1,
					successful: 1,
					failed: 1,
				},
			},
			{
				$sort: { total: -1 },
			},
		]);

		res.status(200).send({
			totalEmails,
			successful,
			failed,
			successRate: totalEmails > 0 ? ((successful / totalEmails) * 100).toFixed(2) + '%' : '0%',
			byUser,
		});
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Get external API fetch counts per user
const getPricesReport = async (req, res) => {
	try {
		const totalFetches = await storageExecutionModel.countDocuments();
		const successful = await storageExecutionModel.countDocuments({ executionStatus: progressStatuses.SUCCESS });
		const failed = await storageExecutionModel.countDocuments({ executionStatus: progressStatuses.FAILURE });
		const uniqueSymbols = await storageExecutionModel.distinct('symbol');

		// Fetches per user
		const byUser = await storageExecutionModel.aggregate([
			{
				$group: {
					_id: '$userId',
					total: { $sum: 1 },
					successful: {
						$sum: { $cond: [{ $eq: ['$executionStatus', progressStatuses.SUCCESS] }, 1, 0] },
					},
					failed: {
						$sum: { $cond: [{ $eq: ['$executionStatus', progressStatuses.FAILURE] }, 1, 0] },
					},
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: '_id',
					as: 'user',
				},
			},
			{
				$unwind: '$user',
			},
			{
				$project: {
					_id: 1,
					email: '$user.email',
					name: '$user.name',
					total: 1,
					successful: 1,
					failed: 1,
				},
			},
			{
				$sort: { total: -1 },
			},
		]);

		res.status(200).send({
			totalFetches,
			successful,
			failed,
			successRate: totalFetches > 0 ? ((successful / totalFetches) * 100).toFixed(2) + '%' : '0%',
			uniqueSymbols: uniqueSymbols.length,
			byUser,
		});
	} catch (err) {
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

module.exports = {
	getJobsReport,
	getEmailsReport,
	getPricesReport,
};
