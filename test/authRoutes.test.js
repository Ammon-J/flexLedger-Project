import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import app from '../server/app.js';

let server;
let apiUrl;

before(async () => {
	server = app.listen(0, '127.0.0.1');
	await new Promise((resolve, reject) => {
		server.once('listening', resolve);
		server.once('error', reject);
	});
	apiUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
	await new Promise((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()));
	});
});

test('register rejects invalid email before contacting the database', async () => {
	const response = await fetch(`${apiUrl}/api/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			firstName: 'Alex',
			lastName: 'Morgan',
			email: 'not-an-email',
			password: 'safePass123',
			confirmPassword: 'safePass123',
		}),
	});

	assert.equal(response.status, 400);
	assert.deepEqual(await response.json(), { message: 'Enter a valid email address.' });
});

test('register requires first and last names', async () => {
	const response = await fetch(`${apiUrl}/api/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			email: 'driver@example.com',
			password: 'safePass123',
			confirmPassword: 'safePass123',
		}),
	});

	assert.equal(response.status, 400);
	assert.deepEqual(await response.json(), {
		message: 'First name is required and must be 100 characters or fewer.',
	});
});

test('opening the register endpoint explains that it accepts POST requests', async () => {
	const response = await fetch(`${apiUrl}/api/register`);

	assert.equal(response.status, 405);
	assert.equal(response.headers.get('allow'), 'POST');
	assert.deepEqual(await response.json(), {
		message: 'Use POST /api/register to submit this request.',
	});
});

test('register rejects passwords that do not satisfy policy', async () => {
	const response = await fetch(`${apiUrl}/api/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			firstName: 'Alex',
			lastName: 'Morgan',
			email: 'driver@example.com',
			password: 'password',
			confirmPassword: 'password',
		}),
	});

	assert.equal(response.status, 400);
	assert.match((await response.json()).message, /at least one number/);
});

test('login rejects malformed credentials before contacting the database', async () => {
	const response = await fetch(`${apiUrl}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: 'invalid', password: 'safePass123' }),
	});

	assert.equal(response.status, 400);
	assert.deepEqual(await response.json(), {
		message: 'Enter a valid email address and password.',
	});
});

test('register reports an unconfigured database with service unavailable', async () => {
	const originalMongoUri = process.env.MONGODB_URI;
	const originalMongoAlias = process.env.MONGO_URI;
	delete process.env.MONGODB_URI;
	delete process.env.MONGO_URI;

	try {
		const response = await fetch(`${apiUrl}/api/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				firstName: 'Alex',
				lastName: 'Morgan',
				email: 'driver@example.com',
				password: 'safePass123',
				confirmPassword: 'safePass123',
			}),
		});

		assert.equal(response.status, 503);
		assert.deepEqual(await response.json(), {
			message: 'Set MONGODB_URI in the environment to enable database operations.',
		});
	} finally {
		if (originalMongoUri === undefined) delete process.env.MONGODB_URI;
		else process.env.MONGODB_URI = originalMongoUri;
		if (originalMongoAlias === undefined) delete process.env.MONGO_URI;
		else process.env.MONGO_URI = originalMongoAlias;
	}
});

test('logout clears the session cookie even when no session is present', async () => {
	const response = await fetch(`${apiUrl}/api/auth/logout`, { method: 'POST' });

	assert.equal(response.status, 200);
	assert.match(response.headers.get('set-cookie'), /HttpOnly/);
	assert.match(response.headers.get('set-cookie'), /SameSite=Lax/);
	assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
	assert.deepEqual(await response.json(), { message: 'Logged out successfully.' });
});

test('unknown API paths return JSON 404 responses', async () => {
	const response = await fetch(`${apiUrl}/api/auth/unknown`, { method: 'POST' });

	assert.equal(response.status, 404);
	assert.deepEqual(await response.json(), { message: 'API route not found.' });
});
