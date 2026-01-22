const crypto = require('crypto');
const axios = require('axios');
const stockMetadataModel = require('../models/stockMetadataModel');
const { scheduleTypes, scheduleTypes: { CRON } } = require('./constants');

const generateSecurePassword = (length = 16) => {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
	return Array.from(crypto.randomBytes(length))
		.map(x => chars[x % chars.length])
		.join('');
};

// Helper function to add job to queue based on schedule type
const addJobToQueue = async (queue, jobId, schedule) => {
	const bullmqJobOptions = {
		jobId: jobId.toString(),
	};

	switch (schedule.type) {
		case scheduleTypes.IMMEDIATE:
			// No delay, process immediately
			await queue.add('process', { jobId: jobId.toString() }, bullmqJobOptions);
			break;

		case scheduleTypes.ONCE:
			// Schedule for specific timestamp
			const delay = new Date(schedule.timestamp).getTime() - Date.now();
			if (delay < 0) {
				throw new Error('Timestamp must be in the future');
			}
			await queue.add('process', { jobId: jobId.toString() }, {
				...bullmqJobOptions,
				delay,
			});
			break;

		case scheduleTypes.CRON:
			// Recurring job with cron pattern
			await queue.add('process', { jobId: jobId.toString() }, {
				...bullmqJobOptions,
				repeat: {
					pattern: schedule.cronExpression,
				},
			});
			break;

		default:
			throw new Error('Invalid schedule type');
	}
};

// Helper function to get currency for a symbol (from DB or API)
const getCurrencyForSymbol = async (symbol, apiKey) => {
	try {
		// First, check if we have it in DB
		const cachedMetadata = await stockMetadataModel.findOne({ symbol: symbol.toUpperCase() });
		if (cachedMetadata) {
			console.log(`[Helper] Currency for ${symbol} found in cache: ${cachedMetadata.currency}`);
			return cachedMetadata.currency;
		}

		// If not in DB, fetch from OVERVIEW API
		console.log(`[Helper] Currency for ${symbol} not in cache, fetching from OVERVIEW API`);
		const response = await axios.get('https://www.alphavantage.co/query', {
			params: {
				function: 'OVERVIEW',
				symbol: symbol,
				apikey: apiKey,
			},
		});

		const overview = response.data;
		if (overview && overview.Currency) {
			// Store in DB for future use
			await stockMetadataModel.create({
				symbol: symbol.toUpperCase(),
				currency: overview.Currency,
				name: overview.Name || null,
				exchange: overview.Exchange || null,
				assetType: overview.AssetType || null,
			});
			console.log(`[Helper] Currency for ${symbol} cached: ${overview.Currency}`);
			return overview.Currency;
		}

		// Fallback to USD if no currency found
		console.warn(`[Helper] No currency found in OVERVIEW for ${symbol}, defaulting to USD`);
		return 'USD';
	} catch (err) {
		console.error(`[Helper] Error fetching currency for ${symbol}:`, err.message);
		return 'USD'; // Fallback
	}
};

// Helper function to remove job from BullMQ queue
const removeJobFromQueue = async (queue, jobId, scheduleType) => {
	try {
		const bullmqJobId = jobId.toString();

		// For CRON jobs, we need to remove the repeatable job
		if (scheduleType === CRON) {
			const repeatableJobs = await queue.getRepeatableJobs();
			const jobToRemove = repeatableJobs.find(j => j.id === bullmqJobId);
			
			if (jobToRemove) {
				await queue.removeRepeatableByKey(jobToRemove.key);
				console.log(`[Helper] Removed repeatable job ${bullmqJobId} from queue`);
			}
		}

		// For all job types (IMMEDIATE, ONCE, CRON), try to remove any pending jobs
		// This handles jobs that haven't been processed yet
		const job = await queue.getJob(bullmqJobId);
		if (job) {
			await job.remove();
			console.log(`[Helper] Removed job ${bullmqJobId} from queue`);
		}
	} catch (err) {
		console.error(`[Helper] Error removing job ${jobId} from queue:`, err.message);
		// Don't throw - we still want to delete from DB even if BullMQ removal fails
	}
};

module.exports = {
	generateSecurePassword,
	addJobToQueue,
	removeJobFromQueue,
	getCurrencyForSymbol,
};