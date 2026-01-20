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