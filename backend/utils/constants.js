const roles = {
	CLIENT: "client",
	ADMIN: "admin",
};

const jobTypes = {
	EMAIL_REMINDER: "emailReminder",
	EMAIL_PRICES: "emailPrices",
	STORE_PRICES: "storePrices",
};

const scheduleTypes = {
	IMMEDIATE: "immediate",
	ONCE: "once",
	CRON: "cron",
};

const progressStatuses = {
	SUCCESS: "success",
	FAILED: "failed",
};

const executionTypes = {
	STORAGE: "storage",
	EMAIL: "email",
};

const emailTypes = {
	REMINDER: "reminder",
	PRICES: "prices",
};

const emailTemplates = {
	USER_REGISTRATION: (name, email, password, role) => ({
		subject: `Welcome to Chronos - Your ${role === roles.ADMIN ? 'Admin' : 'Client'} Account`,
		body: `
Hello ${name},

Your account has been successfully created on Chronos.

Your login credentials:
Email: ${email}
Password: ${password}

Please login and change your password immediately for security purposes.

Best regards,
Chronos Team
		`.trim(),
	}),
	STOCK_PRICES: (metadata) => {
		const currentDate = new Date().toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'UTC'
		});

		let tableRows = '';
		for (const item of metadata) {
			const priceDisplay = item.price !== null 
				? `<span class="price">${item.price.toFixed(2)} ${item.currency}</span>` 
				: '<span class="na">N/A</span>';
			tableRows += `				<tr><td>${item.symbol}</td><td>${priceDisplay}</td></tr>\n`;
		}

		// Get currency from first item (all should have same currency from API)
		const currency = metadata.length > 0 && metadata[0].currency ? metadata[0].currency : 'USD';

		return {
			subject: 'Stock Price Report',
			html: `
<!DOCTYPE html>
<html>
<head>
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
		.content { background-color: #f9f9f9; padding: 20px; }
		table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white; }
		th { background-color: #3498db; color: white; padding: 12px; text-align: left; }
		td { padding: 12px; border-bottom: 1px solid #ddd; }
		tr:hover { background-color: #f5f5f5; }
		.footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d; border-radius: 0 0 5px 5px; }
		.price { font-weight: bold; color: #27ae60; }
		.na { color: #e74c3c; font-style: italic; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Stock Price Report</h1>
			<p>${currentDate}</p>
		</div>
		<div class="content">
			<p>Here are the latest stock prices for your requested symbols:</p>
			<table>
				<tr>
					<th>Symbol</th>
					<th>Price (${currency})</th>
				</tr>
${tableRows}
			</table>
		</div>
		<div class="footer">
			<p>This is an automated report from Chronos Job Scheduler</p>
			<p>Powered by Alpha Vantage API</p>
		</div>
	</div>
</body>
</html>
			`.trim(),
		};
	},
};

module.exports = {
	roles,
	jobTypes,
	scheduleTypes,
	progressStatuses,
	executionTypes,
	emailTypes,
	emailTemplates,
};