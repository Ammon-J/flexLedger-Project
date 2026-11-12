import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { ObjectId } from "mongodb";

const cookieName = "flexledger_jwt";
const lifetimeSeconds = 7 * 24 * 60 * 60;
const secret = Deno.env.get("JWT_SECRET") ??
  randomBytes(32).toString("base64url");

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(input: string): string {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

export function createJwt(userId: ObjectId): string {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    sub: userId.toString(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + lifetimeSeconds,
  });
  return `${header}.${payload}.${sign(`${header}.${payload}`)}`;
}

export function readJwt(request: Request): string | null {
  const cookie = request.headers.get("cookie")?.split(";").map((part) =>
    part.trim()
  ).find((part) => part.startsWith(`${cookieName}=`));
  return cookie?.slice(cookieName.length + 1) || null;
}

export function verifyJwt(token: string): { sub: string } | null {
  const [header, payload, signature] = token.split(".");
  if (
    !header || !payload || !signature ||
    signature.length !== sign(`${header}.${payload}`).length
  ) {
    return null;
  }
  const expected = Buffer.from(sign(`${header}.${payload}`));
  const received = Buffer.from(signature);
  if (!timingSafeEqual(expected, received)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      sub?: string;
      exp?: number;
    };
    return parsed.sub && parsed.exp &&
        parsed.exp > Math.floor(Date.now() / 1000)
      ? { sub: parsed.sub }
      : null;
  } catch {
    return null;
  }
}

export function jwtCookie(token: string, maxAge = lifetimeSeconds): string {
  const secure = Deno.env.get("NODE_ENV") === "production" ? "; Secure" : "";
  return `${cookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

export function clearJwtCookie(): string {
  return jwtCookie("", 0);
}
