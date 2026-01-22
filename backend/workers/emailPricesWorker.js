const { Worker } = require('bullmq');
const { redisConnection, defaultWorkerOptions } = require('../config/redis');
const { emailPricesJobModel } = require('../models/jobModel');
const { emailExecutionModel } = require('../models/executionModel');
const { sendEmail } = require('../services/nodemailerService');
const { progressStatuses, emailTypes, emailTemplates } = require('../utils/constants');
const { getCurrencyForSymbol } = require('../utils/helpers');
const axios = require('axios');

// Create worker for email-prices queue
const emailPricesWorker = new Worker(
	'email-prices',
	async (job) => {
		const { jobId } = job.data;
		console.log(`[EmailPricesWorker] Processing job: ${jobId}`);

		try {
			// Fetch job details from MongoDB
			const jobDoc = await emailPricesJobModel.findById(jobId);
			if (!jobDoc) {
				throw new Error(`Job with id ${jobId} not found`);
			}

			const { userId, payload } = jobDoc;
			const { to, symbols } = payload;

			// Fetch prices for all symbols from Alpha Vantage
			const metadata = [];
			const apiKey = process.env.AV_API_KEY;

			for (const symbol of symbols) {
				try {
					// Get currency (from cache or API)
					const currency = await getCurrencyForSymbol(symbol, apiKey);

					// Fetch current price
					const response = await axios.get('https://www.alphavantage.co/query', {
						params: {
							function: 'GLOBAL_QUOTE',
							symbol: symbol,
							apikey: apiKey,
						},
					});

					const quote = response.data['Global Quote'];
					if (quote && quote['05. price']) {
						metadata.push({
							symbol: symbol,
							price: parseFloat(quote['05. price']),
							currency: currency,
						});
					} else {
						console.warn(`[EmailPricesWorker] No price data found for symbol: ${symbol}`);
						metadata.push({
							symbol: symbol,
							price: null,
							currency: currency,
						});
					}
				} catch (err) {
					console.error(`[EmailPricesWorker] Error fetching price for ${symbol}:`, err.message);
					metadata.push({
						symbol: symbol,
						price: null,
						currency: 'USD',
					});
				}
			}

			// Prepare email content using template
			const emailContent = emailTemplates.STOCK_PRICES(metadata);

			// Send email
			await sendEmail({
				to,
				subject: emailContent.subject,
				html: emailContent.html,
			});

			console.log(`[EmailPricesWorker] Email sent successfully to ${to}`);

			// Create execution record
			await emailExecutionModel.create({
				userId,
				jobId,
				executionStatus: progressStatuses.SUCCESS,
				emailType: emailTypes.PRICES,
				to,
				subject: emailContent.subject,
				metadata,
			});

			// Update job's lastRunAt and lastRunStatus
			await emailPricesJobModel.findByIdAndUpdate(jobId, {
				lastRunAt: new Date(),
				lastRunStatus: progressStatuses.SUCCESS,
			});

			console.log(`[EmailPricesWorker] Job ${jobId} completed successfully`);
		} catch (err) {
			console.error(`[EmailPricesWorker] Error processing job ${jobId}:`, err);

			// Record execution failure
			try {
				const jobDoc = await emailPricesJobModel.findById(jobId);
				if (jobDoc) {
					await emailExecutionModel.create({
						userId: jobDoc.userId,
						jobId,
						executionStatus: progressStatuses.FAILED,
						error: err.message,
						attempt: job.attemptsMade + 1,
						emailType: emailTypes.PRICES,
						to: jobDoc.payload.to,
						subject: 'Stock Price Report',
					});

					await emailPricesJobModel.findByIdAndUpdate(jobId, {
						lastRunAt: new Date(),
						lastRunStatus: progressStatuses.FAILED,
					});
				}
			} catch (recordErr) {
				console.error(`[EmailPricesWorker] Error recording failure:`, recordErr);
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
emailPricesWorker.on('completed', (job) => {
	console.log(`[EmailPricesWorker] Job ${job.id} has completed`);
});

emailPricesWorker.on('failed', (job, err) => {
	console.error(`[EmailPricesWorker] Job ${job.id} has failed with error:`, err.message);
});

emailPricesWorker.on('error', (err) => {
	console.error('[EmailPricesWorker] Worker error:', err);
});

module.exports = emailPricesWorker;
