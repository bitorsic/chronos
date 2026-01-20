const crypto = require('crypto');

const generateSecurePassword = (length = 16) => {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
	return Array.from(crypto.randomBytes(length))
		.map(x => chars[x % chars.length])
		.join('');
};

module.exports = {
	generateSecurePassword,
};