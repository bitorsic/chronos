const { Worker } = require('bullmq');
const { defaultWorkerOptions } = require('../config/redis');
const { jobModel } = require('../models/jobModel');
const { emailExecutionModel } = require('../models/executionModel');
const { sendEmail } = require('../services/nodemailerService');
const { progressStatuses, emailTypes } = require('../utils/constants');

const emailReminderWorker = new Worker(
	'email-reminder',
	async (job) => {
		const { jobId } = job.data;
		const attemptNumber = job.attemptsMade + 1;

		try {
			// Fetch job from MongoDB
			const dbJob = await jobModel.findById(jobId);
			if (!dbJob) {
				throw new Error(`Job ${jobId} not found in database`);
			}

			const { to, subject, body } = dbJob.payload;

			// Send email
			await sendEmail(to, subject, body);

			// Create successful execution record
			await emailExecutionModel.create({
				userId: dbJob.userId,
				jobId: dbJob._id,
				executionStatus: progressStatuses.SUCCESS,
				attempt: attemptNumber,
				emailType: emailTypes.REMINDER,
				to,
				subject,
			});

			// Update job's last run info
			await jobModel.findByIdAndUpdate(jobId, {
				lastRunAt: new Date(),
				lastRunStatus: progressStatuses.SUCCESS,
			});

			return { success: true, message: 'Email sent successfully' };
		} catch (error) {
			console.error(`[EmailReminderWorker] Error processing job ${jobId}:`, error.message);

			// Create failed execution record
			try {
				const dbJob = await jobModel.findById(jobId);
				if (dbJob) {
					await emailExecutionModel.create({
						userId: dbJob.userId,
						jobId: dbJob._id,
						executionStatus: progressStatuses.FAILED,
						error: error.message,
						attempt: attemptNumber,
						emailType: emailTypes.REMINDER,
						to: dbJob.payload.to,
						subject: dbJob.payload.subject,
					});

					// Update job's last run info
					await jobModel.findByIdAndUpdate(jobId, {
						lastRunAt: new Date(),
						lastRunStatus: progressStatuses.FAILED,
					});
				}
			} catch (recordError) {
				console.error(`[EmailReminderWorker] Failed to record execution:`, recordError.message);
			}

			throw error; // Re-throw for BullMQ retry logic
		}
	},
	defaultWorkerOptions
);

// Worker event listeners
emailReminderWorker.on('completed', (job) => {
	console.log(`[EmailReminderWorker] Job ${job.id} completed successfully`);
});

emailReminderWorker.on('failed', (job, err) => {
	console.error(`[EmailReminderWorker] Job ${job?.id} failed:`, err.message);
});

emailReminderWorker.on('error', (err) => {
	console.error('[EmailReminderWorker] Worker error:', err.message);
});

module.exports = emailReminderWorker;
