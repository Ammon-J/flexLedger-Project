import { getDatabase } from '../database.js';
import { hashSessionToken, readSessionToken } from '../auth/session.js';

export async function requireAuth(request, response, next) {
	try {
		const token = readSessionToken(request);
		if (!token) {
			return response.status(401).json({ message: 'Sign in to view this page.' });
		}

		const database = await getDatabase();
		const session = await database.collection('sessions').findOne({
			tokenHash: hashSessionToken(token),
			expiresAt: { $gt: new Date() },
		});
		if (!session) {
			return response.status(401).json({ message: 'Your session has expired. Please sign in again.' });
		}

		const user = await database.collection('users').findOne(
			{ _id: session.userId },
			{ projection: { passwordHash: 0 } },
		);
		if (!user) {
			return response.status(401).json({ message: 'Your account could not be found. Please sign in again.' });
		}

		request.authenticatedUser = user;
		request.database = database;
		return next();
	} catch (error) {
		return next(error);
	}
}
