const Redis = require("ioredis");

const redisConnection = new Redis({
	host: process.env.REDIS_HOST || 'localhost',
	port: process.env.REDIS_PORT || 6379,
	password: process.env.REDIS_PASSWORD || undefined,
	enableReadyCheck: false,
	maxRetriesPerRequest: null,
});

const defaultJobOptions = {
	removeOnComplete: 10,
	removeOnFail: 5,
	attempts: 3,
	backoff: {
		type: 'exponential',
		delay: 2000,
	},
};

const defaultWorkerOptions = {
	connection: redisConnection,
	concurrency: 5,
	limiter: {
		max: 100, // Max 100 jobs per duration
		duration: 60000, // Per minute
	},
};

module.exports = {
	redisConnection,
	defaultJobOptions,
	defaultWorkerOptions,
};
