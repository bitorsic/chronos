const { Worker } = require('bullmq');
const { redisConnection, defaultWorkerOptions } = require('../config/redis');
const { storePricesJobModel } = require('../models/jobModel');
const { storageExecutionModel } = require('../models/executionModel');
const { progressStatuses } = require('../utils/constants');
const { getCurrencyForSymbol } = require('../utils/helpers');
const axios = require('axios');

// Create worker for store-prices queue
const storePricesWorker = new Worker(
	'store-prices',
	async (job) => {
		const { jobId } = job.data;
		console.log(`[StorePricesWorker] Processing job: ${jobId}`);

		try {
			// Fetch job details from MongoDB
			const jobDoc = await storePricesJobModel.findById(jobId);
			if (!jobDoc) {
				throw new Error(`Job with id ${jobId} not found`);
			}

			const { userId, payload } = jobDoc;
			const { symbol } = payload;
			const apiKey = process.env.AV_API_KEY;

			// Get currency (from cache or API)
			const currency = await getCurrencyForSymbol(symbol, apiKey);

			// Fetch current price from Alpha Vantage
			const response = await axios.get('https://www.alphavantage.co/query', {
				params: {
					function: 'GLOBAL_QUOTE',
					symbol: symbol,
					apikey: apiKey,
				},
			});

			const quote = response.data['Global Quote'];
			if (!quote || !quote['05. price']) {
				throw new Error(`No price data found for symbol: ${symbol}`);
			}

			const price = parseFloat(quote['05. price']);
			const fetchedAt = new Date();

			console.log(`[StorePricesWorker] Fetched price for ${symbol}: ${price} ${currency}`);

			// Store price in execution record
			await storageExecutionModel.create({
				userId,
				jobId,
				executionStatus: progressStatuses.SUCCESS,
				symbol: symbol,
				price: price,
				currency: currency,
				fetchedAt: fetchedAt,
				attempt: job.attemptsMade + 1,
			});

			// Update job's lastRunAt and lastRunStatus
			await storePricesJobModel.findByIdAndUpdate(jobId, {
				lastRunAt: fetchedAt,
				lastRunStatus: progressStatuses.SUCCESS,
			});

			console.log(`[StorePricesWorker] Job ${jobId} completed successfully. Stored ${symbol} price: ${price} ${currency}`);
		} catch (err) {
			console.error(`[StorePricesWorker] Error processing job ${jobId}:`, err);

			// Record execution failure
			try {
				const jobDoc = await storePricesJobModel.findById(jobId);
				if (jobDoc) {
					const currency = await getCurrencyForSymbol(jobDoc.payload.symbol, process.env.AV_API_KEY);
					
					await storageExecutionModel.create({
						userId: jobDoc.userId,
						jobId,
						executionStatus: progressStatuses.FAILED,
						error: err.message,
						attempt: job.attemptsMade + 1,
						symbol: jobDoc.payload.symbol,
						price: null,
						currency: currency,
						fetchedAt: new Date(),
					});

					await storePricesJobModel.findByIdAndUpdate(jobId, {
						lastRunAt: new Date(),
						lastRunStatus: progressStatuses.FAILED,
					});
				}
			} catch (recordErr) {
				console.error(`[StorePricesWorker] Error recording failure:`, recordErr);
			}

			throw err; // Re-throw to let BullMQ handle retries
		}
	},
	{
		connection: redisConnection,
		...defaultWorkerOptions,
	}
);

// Event listeners
storePricesWorker.on('completed', (job) => {
	console.log(`[StorePricesWorker] Job ${job.id} has completed`);
});

storePricesWorker.on('failed', (job, err) => {
	console.error(`[StorePricesWorker] Job ${job.id} has failed with error:`, err.message);
});

storePricesWorker.on('error', (err) => {
	console.error('[StorePricesWorker] Worker error:', err);
});

module.exports = storePricesWorker;
