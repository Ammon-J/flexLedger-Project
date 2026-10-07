import app from './app.js';
import { closeDatabase } from './database.js';

const port = Number(process.env.API_PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
	throw new Error('API_PORT must be a valid TCP port.');
}

const server = app.listen(port, () => {
	console.log(`FlexLedger API listening on http://localhost:${port}`);
	if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
		console.warn('Set MONGODB_URI in .env to enable account creation and login.');
	}
});

async function shutdown() {
	server.close(async (error) => {
		if (error) {
			console.error('Failed to stop the API server cleanly:', error);
			process.exitCode = 1;
		}
		try {
			await closeDatabase();
		} catch (databaseError) {
			console.error('Failed to close the database connection:', databaseError);
			process.exitCode = 1;
		}
	});
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
