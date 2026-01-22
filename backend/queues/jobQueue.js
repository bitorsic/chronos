const { Queue } = require('bullmq');
const { redisConnection, defaultJobOptions } = require('../config/redis');

// Separate queues for each job type
const emailReminderQueue = new Queue('email-reminder', {
	connection: redisConnection,
	defaultJobOptions,
});

const emailPricesQueue = new Queue('email-prices', {
	connection: redisConnection,
	defaultJobOptions,
});

const storePricesQueue = new Queue('store-prices', {
	connection: redisConnection,
	defaultJobOptions,
});

module.exports = {
	emailReminderQueue,
	emailPricesQueue,
	storePricesQueue,
};
