import { createHash, randomBytes } from "node:crypto";
import type { Db, ObjectId } from "mongodb";

export const sessionCookieName = "flexledger_session";
const sessionLifetimeSeconds = 7 * 24 * 60 * 60;

export function readSessionToken(request: Request): string | null {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  const cookie = cookies.map((value) => value.trim()).find((value) =>
    value.startsWith(`${sessionCookieName}=`)
  );
  return cookie?.slice(sessionCookieName.length + 1) || null;
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  database: Db,
  userId: ObjectId,
): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await database.collection("sessions").insertOne({
    userId,
    tokenHash: hashSessionToken(token),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + sessionLifetimeSeconds * 1000),
  });
  return token;
}

export function sessionCookie(
  token: string,
  maxAge = sessionLifetimeSeconds,
): string {
  const secure = Deno.env.get("NODE_ENV") === "production" ? "; Secure" : "";
  return `${sessionCookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie(): string {
  return sessionCookie("", 0);
}
