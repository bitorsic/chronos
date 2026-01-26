const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

		// Find or create admin user
		let admin = await userModel.findOne({ email: 'yashjaiswal.cse@gmail.com' });
		if (!admin) {
			console.log('[+] Admin user not found, creating...');
			const hashedPassword = await bcrypt.hash('admin123', 10);
			admin = await userModel.create({
				name: 'Yash Jaiswal',
				email: 'yashjaiswal.cse@gmail.com',
				password: hashedPassword,
				role: 'admin',
			});
			console.log('[+] Created admin user');
		} else {
			console.log('[+] Found admin:', admin.email);
		}

		// Create dummy client users
		console.log('[+] Creating dummy client users...');
		const dummyClients = [
			{ name: 'Alice Johnson', email: 'alice.johnson@example.com', password: 'client123' },
			{ name: 'Bob Smith', email: 'bob.smith@example.com', password: 'client123' },
			{ name: 'Charlie Brown', email: 'charlie.brown@example.com', password: 'client123' },
			{ name: 'Diana Prince', email: 'diana.prince@example.com', password: 'client123' },
			{ name: 'Ethan Hunt', email: 'ethan.hunt@example.com', password: 'client123' },
		];

		// Delete existing dummy clients (to avoid duplicates)
		await userModel.deleteMany({ 
			email: { $in: dummyClients.map(c => c.email) } 
		});

		const clients = [];
		for (const clientData of dummyClients) {
			const hashedPassword = await bcrypt.hash(clientData.password, 10);
			const client = await userModel.create({
				name: clientData.name,
				email: clientData.email,
				password: hashedPassword,
				role: 'client',
			});
			clients.push(client);
			console.log(`[+] Created client: ${client.email}`);
		}

		console.log(`[+] Created ${clients.length} client users`);

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
		// CREATE EMAIL REMINDER JOBS (Distributed across clients)
		// ========================================
		console.log('\n[+] Creating Email Reminder jobs...');
		
		// Create 2-3 reminder jobs per client
		for (const client of clients) {
			const numReminders = Math.floor(Math.random() * 2) + 2; // 2-3 jobs
			
			for (let i = 0; i < numReminders; i++) {
				const scheduleType = [scheduleTypes.IMMEDIATE, scheduleTypes.ONCE, scheduleTypes.CRON][Math.floor(Math.random() * 3)];
				const scheduleConfig = {};
				
				if (scheduleType === scheduleTypes.ONCE) {
					scheduleConfig.timestamp = getRandomFutureDate(5);
				} else if (scheduleType === scheduleTypes.CRON) {
					scheduleConfig.cronExpression = cronExpressions[Math.floor(Math.random() * cronExpressions.length)];
				}
				
				const reminder = await emailReminderJobModel.create({
					userId: client._id,
					schedule: {
						type: scheduleType,
						...scheduleConfig,
					},
					payload: {
						to: client.email,
						subject: reminderSubjects[Math.floor(Math.random() * reminderSubjects.length)],
						body: `Reminder for ${client.email}: ${reminderSubjects[Math.floor(Math.random() * reminderSubjects.length)]}`,
					},
					lastRunStatus: scheduleType === scheduleTypes.IMMEDIATE ? progressStatuses.SUCCESS : (Math.random() > 0.3 ? progressStatuses.SUCCESS : progressStatuses.FAILED),
					createdAt: getRandomPastDate(15),
				});
				createdJobs.push(reminder);
			}
		}

		console.log(`[+] Created ${createdJobs.length} Email Reminder jobs`);

		// ========================================
		// CREATE EMAIL PRICES JOBS (Distributed across clients)
		// ========================================
		console.log('\n[+] Creating Email Prices jobs...');
		const emailPricesStartCount = createdJobs.length;

		// Create 1-3 price email jobs per client
		for (const client of clients) {
			const numPriceJobs = Math.floor(Math.random() * 3) + 1; // 1-3 jobs
			
			for (let i = 0; i < numPriceJobs; i++) {
				// Random symbols (2-4 stocks)
				const numSymbols = Math.floor(Math.random() * 3) + 2;
				const selectedSymbols = [];
				const availableSymbols = [...stockSymbols];
				
				for (let j = 0; j < numSymbols; j++) {
					const idx = Math.floor(Math.random() * availableSymbols.length);
					selectedSymbols.push(availableSymbols.splice(idx, 1)[0]);
				}
				
				const scheduleType = [scheduleTypes.IMMEDIATE, scheduleTypes.ONCE, scheduleTypes.CRON][Math.floor(Math.random() * 3)];
				const scheduleConfig = {};
				
				if (scheduleType === scheduleTypes.ONCE) {
					scheduleConfig.timestamp = getRandomFutureDate(5);
				} else if (scheduleType === scheduleTypes.CRON) {
					scheduleConfig.cronExpression = cronExpressions[Math.floor(Math.random() * cronExpressions.length)];
				}
				
				const priceJob = await emailPricesJobModel.create({
					userId: client._id,
					schedule: {
						type: scheduleType,
						...scheduleConfig,
					},
					payload: {
						to: client.email,
						symbols: selectedSymbols,
					},
					lastRunStatus: scheduleType === scheduleTypes.IMMEDIATE ? progressStatuses.SUCCESS : (Math.random() > 0.2 ? progressStatuses.SUCCESS : progressStatuses.FAILED),
					createdAt: getRandomPastDate(30),
				});
				createdJobs.push(priceJob);
			}
		}

		// Admin also gets a few monitoring jobs
		const adminPriceJob = await emailPricesJobModel.create({
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
		createdJobs.push(adminPriceJob);

		console.log(`[+] Created ${createdJobs.length - emailPricesStartCount} Email Prices jobs`);

		// ========================================
		// CREATE STORE PRICES JOBS (Distributed across clients & Admin)
		// ========================================
		console.log('\n[+] Creating Store Prices jobs...');
		const storePricesStartCount = createdJobs.length;

		// Each client tracks 2-4 stocks
		let symbolIndex = 0;
		for (const client of clients) {
			const numStocks = Math.floor(Math.random() * 3) + 2; // 2-4 stocks
			
			for (let i = 0; i < numStocks; i++) {
				if (symbolIndex >= stockSymbols.length) symbolIndex = 0;
				const symbol = stockSymbols[symbolIndex++];
				
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
		}

		// Admin monitors several key stocks
		const adminStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
		for (const symbol of adminStocks) {
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

		console.log(`[+] Created ${createdJobs.length - storePricesStartCount} Store Prices jobs`);
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
					// For failed emails, some prices might be null
					if (isSuccess) {
						executionData.metadata = job.payload.symbols.map(symbol => ({
							symbol: symbol,
							price: parseFloat((50 + Math.random() * 450).toFixed(2)),
							currency: 'USD',
						}));
					} else {
						// Failed emails might have partial data
						executionData.metadata = job.payload.symbols.map(symbol => ({
							symbol: symbol,
							price: Math.random() > 0.5 ? parseFloat((50 + Math.random() * 450).toFixed(2)) : undefined,
							currency: Math.random() > 0.5 ? 'USD' : undefined,
						}));
					}
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
				
				const executionData = {
					jobId: job._id,
					userId: job.userId,
					symbol: symbol,
					fetchedAt: fetchedAt,
					executionStatus: isSuccess ? progressStatuses.SUCCESS : progressStatuses.FAILED,
					error: isSuccess ? null : 'API rate limit exceeded',
					attempt: isSuccess ? 1 : Math.floor(Math.random() * 3) + 1,
					createdAt: fetchedAt,
				};
				
				// Only add price and currency for successful executions
				if (isSuccess) {
					const basePrice = 100 + Math.random() * 400;
					executionData.price = parseFloat(basePrice.toFixed(2));
					executionData.currency = 'USD';
				}
				
				const execution = await storageExecutionModel.create(executionData);
				createdExecutions.push(execution);
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
		console.log(`Users Created: ${clients.length} clients + 1 admin`);
		console.log('----------------------------------------');
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
		
		// Show distribution per client
		console.log('\nJobs per User:');
		for (const client of clients) {
			const userJobs = createdJobs.filter(j => j.userId.equals(client._id));
			console.log(`  ${client.email}: ${userJobs.length} jobs`);
		}
		const adminJobs = createdJobs.filter(j => j.userId.equals(admin._id));
		console.log(`  ${admin.email}: ${adminJobs.length} jobs`);
		console.log('========================================');
		console.log('\n[+] Dummy data created successfully!');
		console.log('[+] All client passwords: client123');
		console.log('[+] Admin password: admin123');

		process.exit(0);
	} catch (error) {
		console.error('[-] Error creating dummy data:', error);
		process.exit(1);
	}
};

createDummyData();
