import { createHash, randomBytes } from 'node:crypto';

export const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const sessionCookieName = 'flexledger_session';

export function hashSessionToken(token) {
	return createHash('sha256').update(token).digest('hex');
}

export function readSessionToken(request) {
	const cookieHeader = request.headers.cookie;
	if (!cookieHeader) return null;

	const cookie = cookieHeader
		.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${sessionCookieName}=`));

	return cookie ? cookie.slice(sessionCookieName.length + 1) || null : null;
}

export function setSessionCookie(response, token, maxAgeSeconds = sessionLifetimeMs / 1000) {
	const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
	response.setHeader(
		'Set-Cookie',
		`${sessionCookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${secure}`,
	);
}

export async function createSession(database, userId, response) {
	const token = randomBytes(32).toString('base64url');
	const expiresAt = new Date(Date.now() + sessionLifetimeMs);

	await database.collection('sessions').insertOne({
		userId,
		tokenHash: hashSessionToken(token),
		createdAt: new Date(),
		expiresAt,
	});

	setSessionCookie(response, token);
}
