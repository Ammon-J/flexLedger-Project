import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBlock } from '../server/controllers/blockController.js';

function createResponse() {
	return {
		statusCode: 200,
		body: undefined,
		status(statusCode) {
			this.statusCode = statusCode;
			return this;
		},
		json(body) {
			this.body = body;
			return this;
		},
	};
}

function createRequest(body) {
	const inserted = [];
	const request = {
		body,
		authenticatedUser: { _id: 'user-123', defaultVehicle: '2017 Ford Fusion SE, AWD' },
		database: {
			collection(name) {
				assert.equal(name, 'blocks');
				return {
					async insertOne(document) {
						inserted.push(document);
						return { insertedId: { toString: () => 'block-123' } };
					},
				};
			},
		},
	};
	return { request, inserted };
}

test('createBlock stores block fields under the authenticated user and calculates miles', async () => {
	const { request, inserted } = createRequest({
		date: '2026-10-07',
		startOdometer: 42180,
		endOdometer: 42304,
		earnings: 108.5,
		routeNotes: '  North loop - apartment-heavy route.  ',
		userId: 'attacker-controlled-user',
		milesDriven: 9999,
	});
	const response = createResponse();

	await createBlock(request, response, (error) => {
		throw error;
	});

	assert.equal(response.statusCode, 201);
	assert.deepEqual(response.body, {
		message: 'Delivery block saved.',
		block: {
			id: 'block-123',
			date: '2026-10-07T12:00:00.000Z',
			startOdometer: 42180,
			endOdometer: 42304,
			milesDriven: 124,
			vehicle: '2017 Ford Fusion SE, AWD',
			earnings: 108.5,
			routeNotes: 'North loop - apartment-heavy route.',
		},
	});
	assert.equal(inserted.length, 1);
	assert.equal(inserted[0].userId, 'user-123');
	assert.equal(inserted[0].milesDriven, 124);
	assert.equal(inserted[0].vehicle, '2017 Ford Fusion SE, AWD');
	assert.equal(inserted[0].date.toISOString(), '2026-10-07T12:00:00.000Z');
	assert.equal(inserted[0].createdAt instanceof Date, true);
	assert.equal('userId' in response.body.block, false);
});

test('createBlock accepts omitted optional earnings and route notes', async () => {
	const { request, inserted } = createRequest({
		date: '2026-10-07',
		startOdometer: '42180',
		endOdometer: '42180',
	});
	const response = createResponse();

	await createBlock(request, response, (error) => {
		throw error;
	});

	assert.equal(response.statusCode, 201);
	assert.equal(response.body.block.milesDriven, 0);
	assert.equal('earnings' in inserted[0], false);
	assert.equal('routeNotes' in inserted[0], false);
});

test('createBlock rejects invalid dates and odometer ranges without inserting', async (context) => {
	const invalidBodies = [
		{ date: '2026-02-30', startOdometer: 10, endOdometer: 20 },
		{ date: '2026-10-07', startOdometer: -1, endOdometer: 20 },
		{ date: '2026-10-07', startOdometer: 20, endOdometer: 19 },
		{ date: '2026-10-07', startOdometer: 10, endOdometer: 20, earnings: 2.345 },
		{ date: '2026-10-07', startOdometer: 10, endOdometer: 20, routeNotes: 123 },
	];

	for (const body of invalidBodies) {
		await context.test(JSON.stringify(body), async () => {
			const { request, inserted } = createRequest(body);
			const response = createResponse();

			await createBlock(request, response, (error) => {
				throw error;
			});

			assert.equal(response.statusCode, 400);
			assert.equal(typeof response.body.message, 'string');
			assert.equal(inserted.length, 0);
		});
	}
});

test('createBlock forwards database errors to the error handler', async () => {
	const request = {
		body: { date: '2026-10-07', startOdometer: 10, endOdometer: 20 },
		authenticatedUser: { _id: 'user-123' },
		database: {
			collection() {
				return { insertOne: async () => { throw new Error('database unavailable'); } };
			},
		},
	};
	const response = createResponse();
	let forwardedError;

	await createBlock(request, response, (error) => {
		forwardedError = error;
	});

	assert.equal(forwardedError?.message, 'database unavailable');
});
