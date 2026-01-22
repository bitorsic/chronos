const { emailReminderJobModel, emailPricesJobModel, storePricesJobModel } = require('../models/jobModel');
const { handleError } = require('../utils/errorHandler');
const { addJobToQueue } = require('../utils/helpers');
const { emailReminderQueue, emailPricesQueue, storePricesQueue } = require('../queues/jobQueue');

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
		const [status, message] = handleError(err);
		res.status(status).send({ message });
	}
};

module.exports = {
	createEmailReminderJob,
	createEmailPricesJob,
	createStorePricesJob,
};
