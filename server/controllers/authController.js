import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { getDatabase } from '../database.js';
import { createSession, hashSessionToken, readSessionToken, setSessionCookie } from '../auth/session.js';

const scrypt = promisify(scryptCallback);
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const passwordKeyLength = 64;
const passwordSaltLength = 16;
const passwordHashParameters = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function normalizeEmail(value) {
	return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeName(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email) {
	return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPassword(value) {
	return typeof value === 'string' ? value : '';
}

async function hashPassword(password) {
	const salt = randomBytes(passwordSaltLength);
	const derivedKey = await scrypt(password, salt, passwordKeyLength, passwordHashParameters);
	return `scrypt$16384$8$1$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
}

async function verifyPassword(password, encodedHash) {
	const [algorithm, cost, blockSize, parallelization, encodedSalt, encodedKey] = encodedHash.split('$');
	if (
		algorithm !== 'scrypt' ||
		cost !== '16384' ||
		blockSize !== '8' ||
		parallelization !== '1' ||
		!encodedSalt ||
		!encodedKey
	) {
		throw new Error('Stored password hash has an invalid format.');
	}

	const salt = Buffer.from(encodedSalt, 'base64url');
	const expectedKey = Buffer.from(encodedKey, 'base64url');
	if (salt.length !== passwordSaltLength || expectedKey.length !== passwordKeyLength) {
		throw new Error('Stored password hash has an invalid format.');
	}
	const actualKey = await scrypt(password, salt, passwordKeyLength, passwordHashParameters);

	return timingSafeEqual(actualKey, expectedKey);
}

function publicUser(user) {
	return {
		id: user._id.toString(),
		email: user.email,
		...(user.firstName ? { firstName: user.firstName } : {}),
		...(user.lastName ? { lastName: user.lastName } : {}),
		...(user.defaultVehicle ? { defaultVehicle: user.defaultVehicle } : {}),
	};
}

export async function register(request, response, next) {
	try {
		const firstName = normalizeName(request.body?.firstName);
		const lastName = normalizeName(request.body?.lastName);
		const email = normalizeEmail(request.body?.email);
		const password = getPassword(request.body?.password);
		const confirmPassword = getPassword(request.body?.confirmPassword);
		const vehicleValue = request.body?.defaultVehicle;
		const defaultVehicle = typeof vehicleValue === 'string' ? vehicleValue.trim() : '';

		if (firstName.length < 1 || firstName.length > 100) {
			return response.status(400).json({ message: 'First name is required and must be 100 characters or fewer.' });
		}
		if (lastName.length < 1 || lastName.length > 100) {
			return response.status(400).json({ message: 'Last name is required and must be 100 characters or fewer.' });
		}
		if (!isValidEmail(email)) {
			return response.status(400).json({ message: 'Enter a valid email address.' });
		}
		if (password.length < 8 || password.length > 128 || !/\d/.test(password)) {
			return response.status(400).json({
				message: 'Password must be 8-128 characters and include at least one number.',
			});
		}
		if (password !== confirmPassword) {
			return response.status(400).json({ message: 'Passwords do not match.' });
		}
		if (typeof vehicleValue !== 'undefined' && typeof vehicleValue !== 'string') {
			return response.status(400).json({ message: 'Default vehicle must be text.' });
		}
		if (defaultVehicle.length > 120) {
			return response.status(400).json({ message: 'Default vehicle must be 120 characters or fewer.' });
		}

		const database = await getDatabase();
		const user = {
			firstName,
			lastName,
			email,
			passwordHash: await hashPassword(password),
			createdAt: new Date(),
			...(defaultVehicle ? { defaultVehicle } : {}),
		};

		const users = database.collection('users');
		let insertedId;
		try {
			const result = await users.insertOne(user);
			insertedId = result.insertedId;
			await createSession(database, result.insertedId, response);
			const createdUser = { ...user, _id: result.insertedId };
			return response.status(201).json({
				message: 'Account created successfully. Welcome, ' + user.firstName + '!',
				user: publicUser(createdUser),
			});
		} catch (error) {
			if (error?.code === 11000 && error.keyPattern?.email) {
				return response.status(409).json({ message: 'An account with this email already exists.' });
			}
			if (insertedId) {
				try {
					await users.deleteOne({ _id: insertedId });
				} catch (rollbackError) {
					error.rollbackError = rollbackError;
				}
			}
			throw error;
		}
	} catch (error) {
		return next(error);
	}
}

export async function login(request, response, next) {
	try {
		const email = normalizeEmail(request.body?.email);
		const password = getPassword(request.body?.password);

		if (!isValidEmail(email) || !password || password.length > 128) {
			return response.status(400).json({ message: 'Enter a valid email address and password.' });
		}

		const database = await getDatabase();
		const user = await database.collection('users').findOne({ email });
		if (!user || !(await verifyPassword(password, user.passwordHash))) {
			return response.status(401).json({ message: 'Invalid email or password.' });
		}

		await createSession(database, user._id, response);
		return response.status(200).json({
			message: 'Logged in successfully.',
			user: publicUser(user),
		});
	} catch (error) {
		return next(error);
	}
}

export async function logout(request, response, next) {
	try {
		const token = readSessionToken(request);
		if (token) {
			const database = await getDatabase();
			await database.collection('sessions').deleteOne({ tokenHash: hashSessionToken(token) });
		}

		setSessionCookie(response, '', 0);
		return response.status(200).json({ message: 'Logged out successfully.' });
	} catch (error) {
		return next(error);
	}
}
