const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

// loading the correct env file for dev / prod environment
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, `.env.${process.env.NODE_ENV || "dev"}`) });

// Check if temp folder exists, create if not
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const app = express();
app.use(express.json());
app.use(cors({
	origin: "*",
	credentials: true,
}));

// Routes
app.use('/api/users', require('./routes/userRoutes'));

if (process.env.NODE_ENV !== "prod") {
	// Swagger configuration
	const swaggerUi = require('swagger-ui-express');
	const yaml = require('js-yaml');
	const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, 'docs/openapi.yaml'), 'utf8'));

	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
		customCss: '.swagger-ui .topbar { display: none }',
	}));
}

(async () => {
	try {
		console.log("[+] Connecting to MongoDB...");
		await mongoose.connect(process.env.DB_URL);
		console.log("[+] Connection Successful");

		// Start the habit notification worker
		// const { habitNotificationWorker } = require('./services/habitNotificationSchedulerService');
		// console.log("[+] Habit notification worker started");

		// Start the subscription status worker
		// const { scheduleSubscriptionStatusWorker } = require('./services/subscriptionStatusService');
		// await scheduleSubscriptionStatusWorker();
		// console.log("[+] Subscription status worker started");

		const port = process.env.PORT || 8080;
		app.listen(port, (err) => {
			if (err) throw err;
			console.log('[+] Server running on port ' + port);
		});
	} catch (e) {
		console.log("[-] Connection Failed");
	}
})();