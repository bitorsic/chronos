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

module.exports = {
	roles,
	jobTypes,
	scheduleTypes,
	progressStatuses,
	executionTypes,
	emailTypes,
};