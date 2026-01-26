const { emailReminderJobModel, emailPricesJobModel, storePricesJobModel, jobModel } = require('../models/jobModel');
const { executionModel, storageExecutionModel, emailExecutionModel } = require('../models/executionModel');
const { handleError } = require('../utils/errorHandler');
const { addJobToQueue, removeJobFromQueue } = require('../utils/helpers');
const { emailReminderQueue, emailPricesQueue, storePricesQueue } = require('../queues/jobQueue');
const { jobTypes, roles } = require('../utils/constants');

// Create email reminder job
const createEmailReminderJob = async (req, res) => {
	try {
		const { to, subject, body, schedule } = req.body;
		const userId = req.user.id;

		// Create job in MongoDB
		const job = await emailReminderJobModel.create({
			userId,
			schedule,
			payload: {
				to,
				subject,
				body,
			},
		});

		// Add to BullMQ queue based on schedule type
		await addJobToQueue(emailReminderQueue, job._id, schedule);

		res.status(201).send({
			message: 'Email reminder job created successfully',
			job: {
				id: job._id,
				userId: job.userId,
				jobType: job.jobType,
				schedule: job.schedule,
				payload: job.payload,
			},
		});
	} catch (err) {
		console.error(err);
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Create email prices job
const createEmailPricesJob = async (req, res) => {
	try {
		const { to, symbols, schedule } = req.body;
		const userId = req.user.id;

		// Create job in MongoDB
		const job = await emailPricesJobModel.create({
			userId,
			schedule,
			payload: {
				to,
				symbols,
			},
		});

		// Add to BullMQ queue based on schedule type
		await addJobToQueue(emailPricesQueue, job._id, schedule);

		res.status(201).send({
			message: 'Email prices job created successfully',
			job: {
				id: job._id,
				userId: job.userId,
				jobType: job.jobType,
				schedule: job.schedule,
				payload: job.payload,
			},
		});
	} catch (err) {
		console.error(err);
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Create store prices job
const createStorePricesJob = async (req, res) => {
	try {
		const { symbol, schedule } = req.body;
		const userId = req.user.id;

		// Create job in MongoDB
		const job = await storePricesJobModel.create({
			userId,
			schedule,
			payload: {
				symbol,
			},
		});

		// Add to BullMQ queue based on schedule type
		await addJobToQueue(storePricesQueue, job._id, schedule);

		res.status(201).send({
			message: 'Store prices job created successfully',
			job: {
				id: job._id,
				userId: job.userId,
				jobType: job.jobType,
				schedule: job.schedule,
				payload: job.payload,
			},
		});
	} catch (err) {
		console.error(err);
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Get all jobs for the authenticated user
const getJobs = async (req, res) => {
	try {
		const userId = req.user.id;
		const userRole = req.user.role;
		const { jobType, limit = 50, skip = 0 } = req.query;

		// Build query - admins can see all jobs, clients only see their own
		const query = userRole === roles.ADMIN ? {} : { userId };
		if (jobType) {
			query.jobType = jobType;
		}

		// Fetch jobs with pagination
		const jobs = await jobModel
			.find(query)
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.skip(parseInt(skip))
			.select('-__v')
			.populate('userId', 'name email'); // Populate user info for admin view

		const total = await jobModel.countDocuments(query);

		res.status(200).send({
			jobs,
			pagination: {
				total,
				limit: parseInt(limit),
				skip: parseInt(skip),
				hasMore: skip + jobs.length < total,
			},
		});
	} catch (err) {
		console.error(err);
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Get a specific job by ID
const getJobById = async (req, res) => {
	try {
		const userId = req.user.id;
		const userRole = req.user.role;
		const { jobId } = req.params;

		// Build query - admins can view any job, clients only their own
		const query = userRole === roles.ADMIN ? { _id: jobId } : { _id: jobId, userId };

		const job = await jobModel
			.findOne(query)
			.select('-__v')
			.populate('userId', 'name email'); // Populate user info

		if (!job) {
			return res.status(404).send({ message: 'Job not found' });
		}

		res.status(200).send({ job });
	} catch (err) {
		console.error(err);
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Delete a job
const deleteJob = async (req, res) => {
	try {
		const userId = req.user.id;
		const userRole = req.user.role;
		const { jobId } = req.params;

		// Build query - admins can delete any job, clients only their own
		const query = userRole === roles.ADMIN ? { _id: jobId } : { _id: jobId, userId };

		const job = await jobModel.findOne(query);

		if (!job) {
			return res.status(404).send({ message: 'Job not found' });
		}

		// Determine which queue to use based on job type
		let queue;
		switch (job.jobType) {
			case jobTypes.EMAIL_REMINDER:
				queue = emailReminderQueue;
				break;
			case jobTypes.EMAIL_PRICES:
				queue = emailPricesQueue;
				break;
			case jobTypes.STORE_PRICES:
				queue = storePricesQueue;
				break;
			default:
				return res.status(400).send({ message: 'Invalid job type' });
		}

		// Remove from BullMQ queue
		await removeJobFromQueue(queue, job._id, job.schedule.type);

		// Delete from MongoDB
		await jobModel.findByIdAndDelete(jobId);

		res.status(200).send({ message: 'Job deleted successfully' });
	} catch (err) {
		console.error(err);
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Get all executions for the authenticated user
const getExecutions = async (req, res) => {
	try {
		const userId = req.user.id;
		const userRole = req.user.role;
		const { jobId, executionStatus, type, limit = 50, skip = 0 } = req.query;

		// Build query - admins can see all executions, clients only see their own
		const query = userRole === roles.ADMIN ? {} : { userId };
		if (jobId) {
			query.jobId = jobId;
		}
		if (executionStatus) {
			query.executionStatus = executionStatus;
		}
		if (type) {
			query.type = type;
		}

		// Fetch executions with pagination
		const executions = await executionModel
			.find(query)
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.skip(parseInt(skip))
			.select('-__v')
			.populate('jobId', 'jobType payload schedule')
			.populate('userId', 'name email'); // Populate user info for admin view

		const total = await executionModel.countDocuments(query);

		res.status(200).send({
			executions,
			pagination: {
				total,
				limit: parseInt(limit),
				skip: parseInt(skip),
				hasMore: skip + executions.length < total,
			},
		});
	} catch (err) {
		console.error(err);
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Get a specific execution by ID
const getExecutionById = async (req, res) => {
	try {
		const userId = req.user.id;
		const userRole = req.user.role;
		const { executionId } = req.params;

		const query = userRole === roles.ADMIN ? { _id: executionId } : { _id: executionId, userId };
		const execution = await executionModel
			.findOne(query)
			.select('-__v')
			.populate('jobId', 'jobType payload schedule')
			.populate('userId', 'name email');

		if (!execution) {
			return res.status(404).send({ message: 'Execution not found' });
		}

		res.status(200).send({ execution });
	} catch (err) {
		console.error(err);
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Get price executions for a specific STORE_PRICES job
const getJobPrices = async (req, res) => {
	try {
		const userId = req.user.id;
		const userRole = req.user.role;
		const { jobId } = req.params;
		const { limit = 100, skip = 0 } = req.query;

		// Build query - admins can view any job, clients only their own
		const jobQuery = userRole === roles.ADMIN ? { _id: jobId } : { _id: jobId, userId };

		// Use discriminator model to verify job exists and is STORE_PRICES type
		const job = await storePricesJobModel.findOne(jobQuery);

		if (!job) {
			return res.status(404).send({ 
				message: 'STORE_PRICES job not found' 
			});
		}

		// Build executions query - admins can view all executions for the job, clients only their own
		const execQuery = userRole === roles.ADMIN ? { jobId } : { jobId, userId };

		// Fetch storage executions for this job
		const prices = await storageExecutionModel
			.find(execQuery)
			.select('symbol price currency fetchedAt executionStatus error attempt')
			.sort({ fetchedAt: -1 }) // Most recent first
			.limit(parseInt(limit))
			.skip(parseInt(skip));

		// Get total count for pagination
		const total = await storageExecutionModel.countDocuments(execQuery);

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
		console.error(err);
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

// Get email executions for a specific email job (EMAIL_REMINDER or EMAIL_PRICES)
const getJobEmails = async (req, res) => {
	try {
		const userId = req.user.id;
		const userRole = req.user.role;
		const { jobId } = req.params;
		const { limit = 100, skip = 0 } = req.query;

		// Build query - admins can view any job, clients only their own
		const jobQuery = userRole === roles.ADMIN ? { _id: jobId } : { _id: jobId, userId };

		// First verify the job exists
		const job = await jobModel.findOne(jobQuery);

		if (!job) {
			return res.status(404).send({ message: 'Job not found' });
		}

		// Verify it's an email job type
		if (job.jobType !== jobTypes.EMAIL_REMINDER && job.jobType !== jobTypes.EMAIL_PRICES) {
			return res.status(400).send({ 
				message: 'This endpoint is only available for email jobs (EMAIL_REMINDER or EMAIL_PRICES)' 
			});
		}

		// Build executions query - admins can view all executions for the job, clients only their own
		const execQuery = userRole === roles.ADMIN ? { jobId } : { jobId, userId };

		// Fetch email executions for this job
		const emails = await emailExecutionModel
			.find(execQuery)
			.select('emailType to subject executionStatus error attempt metadata createdAt')
			.sort({ createdAt: -1 }) // Most recent first
			.limit(parseInt(limit))
			.skip(parseInt(skip));

		// Get total count for pagination
		const total = await emailExecutionModel.countDocuments(execQuery);

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
	createEmailReminderJob,
	createEmailPricesJob,
	createStorePricesJob,
	getJobs,
	getJobById,
	deleteJob,
	getExecutions,
	getExecutionById,
	getJobPrices,
	getJobEmails,
};
