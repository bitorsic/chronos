const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Load environment variables
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '..', `.env.${process.env.NODE_ENV || "dev"}`) });

const userModel = require('../models/userModel');

const createAdmin = async () => {
	try {
		console.log('[+] Connecting to MongoDB...');
		await mongoose.connect(process.env.DB_URL);
		console.log('[+] Connected to MongoDB');

		const email = 'yashjaiswal.cse@gmail.com';
		const password = 'strongPassword123';
		const name = 'Admin User';

		// Check if user already exists
		const existingUser = await userModel.findOne({ email });
		if (existingUser) {
			console.log('[!] User with this email already exists');
			process.exit(0);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create admin user
		const admin = await userModel.create({
			name,
			email,
			password: hashedPassword,
			role: 'admin',
		});

		console.log('[+] Admin user created successfully!');
		console.log('Email:', email);
		console.log('Password:', password);
		console.log('User ID:', admin._id);

		process.exit(0);
	} catch (error) {
		console.error('[-] Error creating admin:', error.message);
		process.exit(1);
	}
};

createAdmin();
