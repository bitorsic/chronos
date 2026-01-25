const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', `.env.${process.env.NODE_ENV || "dev"}`) });

const userModel = require('../models/userModel');
const { emailReminderJobModel, emailPricesJobModel, storePricesJobModel } = require('../models/jobModel');
const { emailExecutionModel, storageExecutionModel } = require('../models/executionModel');
const { jobTypes, scheduleTypes, progressStatuses, emailTypes } = require('../utils/constants');

// Helper function to get random past date
const getRandomPastDate = (daysAgo) => {
	const date = new Date();
	date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
	date.setHours(Math.floor(Math.random() * 24));
	date.setMinutes(Math.floor(Math.random() * 60));
	return date;
};

// Helper function to get random future date
const getRandomFutureDate = (daysAhead) => {
	const date = new Date();
	date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
	date.setHours(Math.floor(Math.random() * 24));
	date.setMinutes(Math.floor(Math.random() * 60));
	return date;
};

// Stock symbols for dummy data
const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA', 'AMD', 'INTC', 'IBM', 'ORCL', 'CSCO', 'CRM', 'ADBE'];

// Email subjects for reminders
const reminderSubjects = [
	'Team Meeting Reminder',
	'Project Deadline Approaching',
	'Weekly Report Due',
	'Client Call Scheduled',
	'Review Pull Requests',
	'Update Documentation',
	'Quarterly Planning Session',
	'Code Review Session',
	'Sprint Planning Meeting',
	'Daily Standup Reminder',
	'Performance Review Scheduled',
	'Budget Review Meeting'
];

// Cron expressions for variety
const cronExpressions = [
	'0 9 * * 1', // Every Monday at 9 AM
	'0 14 * * *', // Every day at 2 PM
	'0 0 * * 0', // Every Sunday at midnight
	'30 8 * * 1-5', // Weekdays at 8:30 AM
	'0 18 * * 5', // Every Friday at 6 PM
];

const createDummyData = async () => {
	try {
		console.log('[+] Connecting to MongoDB...');
		await mongoose.connect(process.env.DB_URL);
		console.log('[+] Connected to MongoDB');

		// Find existing users
		const client = await userModel.findOne({ email: 'bitorsic@gmail.com' });
		const admin = await userModel.findOne({ email: 'yashjaiswal.cse@gmail.com' });

		if (!client || !admin) {
			console.error('[-] Required users not found. Please ensure both users exist.');
			process.exit(1);
		}

		console.log('[+] Found client:', client.email);
		console.log('[+] Found admin:', admin.email);

		// Clear existing dummy data (optional)
		console.log('[+] Clearing existing job and execution data...');
		await emailReminderJobModel.deleteMany({});
		await emailPricesJobModel.deleteMany({});
		await storePricesJobModel.deleteMany({});
		await emailExecutionModel.deleteMany({});
		await storageExecutionModel.deleteMany({});
		console.log('[+] Cleared existing data');

		const createdJobs = [];
		const createdExecutions = [];

		// ========================================
		// CREATE EMAIL REMINDER JOBS (Client)
		// ========================================
		console.log('\n[+] Creating Email Reminder jobs...');
		
		// Immediate email reminder (completed)
		const immediateReminder = await emailReminderJobModel.create({
			userId: client._id,
			schedule: {
				type: scheduleTypes.IMMEDIATE,
			},
			payload: {
				to: client.email,
				subject: 'Welcome to Chronos!',
				body: 'Your account has been set up successfully. This is a test immediate reminder.',
			},
			lastRunStatus: progressStatuses.SUCCESS,
			createdAt: getRandomPastDate(7),
		});
		createdJobs.push(immediateReminder);

		// Once scheduled reminder (future)
		const onceReminder = await emailReminderJobModel.create({
			userId: client._id,
			schedule: {
				type: scheduleTypes.ONCE,
				timestamp: getRandomFutureDate(5),
			},
			payload: {
				to: client.email,
				subject: reminderSubjects[Math.floor(Math.random() * reminderSubjects.length)],
				body: 'This is a one-time scheduled reminder for an upcoming event.',
			},
			createdAt: getRandomPastDate(3),
		});
		createdJobs.push(onceReminder);

		// Recurring cron reminders
		for (let i = 0; i < 5; i++) {
			const cronReminder = await emailReminderJobModel.create({
				userId: client._id,
				schedule: {
					type: scheduleTypes.CRON,
					cronExpression: cronExpressions[i],
				},
				payload: {
					to: client.email,
					subject: reminderSubjects[i],
					body: `Recurring reminder: ${reminderSubjects[i]}. This runs on schedule: ${cronExpressions[i]}`,
				},
				lastRunStatus: Math.random() > 0.3 ? progressStatuses.SUCCESS : progressStatuses.FAILED,
				createdAt: getRandomPastDate(15),
			});
			createdJobs.push(cronReminder);
		}

		console.log(`[+] Created ${createdJobs.length} Email Reminder jobs`);

		// ========================================
		// CREATE EMAIL PRICES JOBS (Client)
		// ========================================
		console.log('\n[+] Creating Email Prices jobs...');

		// Daily stock prices email
		const dailyPrices = await emailPricesJobModel.create({
			userId: client._id,
			schedule: {
				type: scheduleTypes.CRON,
				cronExpression: '0 16 * * 1-5', // Weekdays at 4 PM (after market close)
			},
			payload: {
				to: client.email,
				symbols: ['AAPL', 'GOOGL', 'MSFT'],
			},
			lastRunStatus: progressStatuses.SUCCESS,
			createdAt: getRandomPastDate(20),
		});
		createdJobs.push(dailyPrices);

		// Weekly portfolio update
		const weeklyPrices = await emailPricesJobModel.create({
			userId: client._id,
			schedule: {
				type: scheduleTypes.CRON,
				cronExpression: '0 9 * * 1', // Monday at 9 AM
			},
			payload: {
				to: client.email,
				symbols: ['TSLA', 'AMZN', 'META', 'NFLX'],
			},
			lastRunStatus: progressStatuses.SUCCESS,
			createdAt: getRandomPastDate(30),
		});
		createdJobs.push(weeklyPrices);

		// One-time price check
		const oncePrices = await emailPricesJobModel.create({
			userId: client._id,
			schedule: {
				type: scheduleTypes.IMMEDIATE,
			},
			payload: {
				to: client.email,
				symbols: ['NVDA', 'AMD'],
			},
			lastRunStatus: progressStatuses.SUCCESS,
			createdAt: getRandomPastDate(2),
		});
		createdJobs.push(oncePrices);

		// Additional email price jobs for variety
		const extraPrices1 = await emailPricesJobModel.create({
			userId: admin._id,
			schedule: {
				type: scheduleTypes.CRON,
				cronExpression: '0 12 * * *', // Daily at noon
			},
			payload: {
				to: admin.email,
				symbols: ['IBM', 'ORCL', 'CSCO'],
			},
			lastRunStatus: progressStatuses.SUCCESS,
			createdAt: getRandomPastDate(45),
		});
		createdJobs.push(extraPrices1);

		const extraPrices2 = await emailPricesJobModel.create({
			userId: client._id,
			schedule: {
				type: scheduleTypes.ONCE,
				timestamp: getRandomFutureDate(3),
			},
			payload: {
				to: client.email,
				symbols: ['CRM', 'ADBE'],
			},
			createdAt: getRandomPastDate(1),
		});
		createdJobs.push(extraPrices2);

		console.log(`[+] Created ${createdJobs.length - 7} Email Prices jobs`);

		// ========================================
		// CREATE STORE PRICES JOBS (Client & Admin)
		// ========================================
		console.log('\n[+] Creating Store Prices jobs...');

		// Client's stock tracking jobs
		for (let i = 0; i < 6; i++) {
			const symbol = stockSymbols[i];
			const storeJob = await storePricesJobModel.create({
				userId: client._id,
				schedule: {
					type: scheduleTypes.CRON,
					cronExpression: '0 */4 * * *', // Every 4 hours
				},
				payload: {
					symbol: symbol,
				},
				lastRunStatus: Math.random() > 0.2 ? progressStatuses.SUCCESS : progressStatuses.FAILED,
				createdAt: getRandomPastDate(25),
			});
			createdJobs.push(storeJob);
		}

		// Admin's monitoring jobs
		for (let i = 6; i < 12; i++) {
			const symbol = stockSymbols[i];
			const storeJob = await storePricesJobModel.create({
				userId: admin._id,
				schedule: {
					type: scheduleTypes.CRON,
					cronExpression: '0 */6 * * *', // Every 6 hours
				},
				payload: {
					symbol: symbol,
				},
				lastRunStatus: progressStatuses.SUCCESS,
				createdAt: getRandomPastDate(40),
			});
			createdJobs.push(storeJob);
		}

		console.log(`[+] Created ${createdJobs.length - 13} Store Prices jobs`);
		console.log(`[+] Total jobs created: ${createdJobs.length}`);

		// ========================================
		// CREATE EMAIL EXECUTIONS
		// ========================================
		console.log('\n[+] Creating Email Executions...');

		// Create executions for email reminder jobs
		const emailJobs = createdJobs.filter(j => 
			j.jobType === jobTypes.EMAIL_REMINDER || j.jobType === jobTypes.EMAIL_PRICES
		);

		for (const job of emailJobs) {
			// Create 5-12 historical executions per job
			const numExecutions = Math.floor(Math.random() * 8) + 5;
			
			for (let i = 0; i < numExecutions; i++) {
				const isSuccess = Math.random() > 0.15; // 85% success rate
				const executedAt = getRandomPastDate(30);
				
				const executionData = {
					jobId: job._id,
					userId: job.userId,
					emailType: job.jobType === jobTypes.EMAIL_REMINDER ? emailTypes.REMINDER : emailTypes.PRICES,
					to: job.payload.to,
					subject: job.jobType === jobTypes.EMAIL_REMINDER 
						? job.payload.subject 
						: `Stock Prices for ${job.payload.symbols.join(', ')}`,
					executionStatus: isSuccess ? progressStatuses.SUCCESS : progressStatuses.FAILED,
					error: isSuccess ? null : 'SMTP connection timeout',
					attempt: Math.random() > 0.8 ? 2 : 1,
					createdAt: executedAt,
				};
				
				// Only add metadata for PRICES emails
				if (job.jobType === jobTypes.EMAIL_PRICES) {
					executionData.metadata = job.payload.symbols.map(symbol => ({
						symbol: symbol,
						price: parseFloat((50 + Math.random() * 450).toFixed(2)),
						currency: 'USD',
					}));
				}
				
				const execution = await emailExecutionModel.create(executionData);
				createdExecutions.push(execution);
			}
		}

		console.log(`[+] Created ${createdExecutions.length} Email Executions`);

		// ========================================
		// CREATE STORAGE EXECUTIONS (PRICES)
		// ========================================
		console.log('\n[+] Creating Storage Executions (Prices)...');

		const storageJobs = createdJobs.filter(j => j.jobType === jobTypes.STORE_PRICES);

		for (const job of storageJobs) {
			const symbol = job.payload.symbol;
			// Create 20-50 price records per job
			const numPrices = Math.floor(Math.random() * 31) + 20;
			
			for (let i = 0; i < numPrices; i++) {
				const isSuccess = Math.random() > 0.1; // 90% success rate
				const fetchedAt = getRandomPastDate(30);
				
				// Generate realistic stock price (between $50 and $500)
				const basePrice = 100 + Math.random() * 400;
				const price = parseFloat(basePrice.toFixed(2));
				
				// Only create successful executions since price is required
				if (isSuccess) {
					const execution = await storageExecutionModel.create({
						jobId: job._id,
						userId: job.userId,
						symbol: symbol,
						price: price,
						currency: 'USD',
						fetchedAt: fetchedAt,
						executionStatus: progressStatuses.SUCCESS,
						error: null,
						attempt: 1,
						createdAt: fetchedAt,
					});
					createdExecutions.push(execution);
				}
			}
		}

		console.log(`[+] Created ${createdExecutions.length - emailJobs.length * 5} Storage Executions`);
		console.log(`[+] Total executions created: ${createdExecutions.length}`);

		// ========================================
		// SUMMARY
		// ========================================
		console.log('\n========================================');
		console.log('DUMMY DATA CREATION SUMMARY');
		console.log('========================================');
		console.log(`Email Reminder Jobs: ${createdJobs.filter(j => j.jobType === jobTypes.EMAIL_REMINDER).length}`);
		console.log(`Email Prices Jobs: ${createdJobs.filter(j => j.jobType === jobTypes.EMAIL_PRICES).length}`);
		console.log(`Store Prices Jobs: ${createdJobs.filter(j => j.jobType === jobTypes.STORE_PRICES).length}`);
		console.log(`Total Jobs: ${createdJobs.length}`);
		console.log('----------------------------------------');
		console.log(`Email Executions: ${createdExecutions.filter(e => e.emailType).length}`);
		console.log(`Storage Executions: ${createdExecutions.filter(e => e.symbol).length}`);
		console.log(`Total Executions: ${createdExecutions.length}`);
		console.log('----------------------------------------');
		console.log(`Success Rate: ${((createdExecutions.filter(e => e.executionStatus === progressStatuses.SUCCESS).length / createdExecutions.length) * 100).toFixed(1)}%`);
		console.log('========================================');
		console.log('\n[+] Dummy data created successfully!');

		process.exit(0);
	} catch (error) {
		console.error('[-] Error creating dummy data:', error);
		process.exit(1);
	}
};

createDummyData();
