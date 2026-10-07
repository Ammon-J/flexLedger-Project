import { MongoClient } from 'mongodb';

let client;
let databasePromise;

export function getDatabase() {
	if (!databasePromise) {
		const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
		if (!uri) {
			const error = new Error('Set MONGODB_URI in the environment to enable database operations.');
			error.code = 'DATABASE_CONFIGURATION_MISSING';
			throw error;
		}

		client = new MongoClient(uri);
		databasePromise = (async () => {
			await client.connect();
			const database = client.db(process.env.MONGODB_DB ?? 'flexledger');

			await Promise.all([
				database.collection('users').createIndex({ email: 1 }, { unique: true }),
				database.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
			]);

			return database;
		})();
	}

	return databasePromise;
}

export async function closeDatabase() {
	if (client) {
		await client.close();
		client = undefined;
		databasePromise = undefined;
	}
}
