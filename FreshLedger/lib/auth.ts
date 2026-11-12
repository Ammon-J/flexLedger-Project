import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import type { Db, ObjectId } from "mongodb";
import { getDatabase } from "./database.ts";
import {
  createSession,
  hashSessionToken,
  readSessionToken,
  sessionCookie,
} from "./session.ts";
import { createJwt, jwtCookie, readJwt, verifyJwt } from "./jwt.ts";

const keyLength = 64;
const saltLength = 16;
const parameters = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, parameters, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

export function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
}

function validEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(saltLength);
  const key = await deriveKey(password, salt);
  return `scrypt$16384$8$1$${salt.toString("base64url")}$${
    key.toString("base64url")
  }`;
}

async function verifyPassword(
  password: string,
  encoded: string,
): Promise<boolean> {
  const [algorithm, cost, blockSize, parallelization, saltValue, keyValue] =
    encoded.split("$");
  if (
    algorithm !== "scrypt" || cost !== "16384" || blockSize !== "8" ||
    parallelization !== "1" || !saltValue || !keyValue
  ) {
    throw new Error("Stored password hash has an invalid format.");
  }
  const salt = Buffer.from(saltValue, "base64url");
  const expected = Buffer.from(keyValue, "base64url");
  const actual = await deriveKey(password, salt);
  return timingSafeEqual(actual, expected);
}

export function publicUser(user: Record<string, unknown>) {
  return {
    id: String(user._id),
    email: user.email,
    ...(user.firstName ? { firstName: user.firstName } : {}),
    ...(user.lastName ? { lastName: user.lastName } : {}),
    ...(user.defaultVehicle ? { defaultVehicle: user.defaultVehicle } : {}),
  };
}

export async function registerUser(
  body: Record<string, unknown>,
): Promise<Response> {
  const firstName = typeof body.firstName === "string"
    ? body.firstName.trim()
    : "";
  const lastName = typeof body.lastName === "string"
    ? body.lastName.trim()
    : "";
  const email = typeof body.email === "string"
    ? body.email.trim().toLowerCase()
    : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string"
    ? body.confirmPassword
    : "";
  const vehicle = typeof body.defaultVehicle === "string"
    ? body.defaultVehicle.trim()
    : "";

  if (!firstName || firstName.length > 100) {
    return json({
      message: "First name is required and must be 100 characters or fewer.",
    }, { status: 400 });
  }
  if (!lastName || lastName.length > 100) {
    return json({
      message: "Last name is required and must be 100 characters or fewer.",
    }, { status: 400 });
  }
  if (!validEmail(email)) {
    return json({ message: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128 || !/\d/.test(password)) {
    return json({
      message:
        "Password must be 8-128 characters and include at least one number.",
    }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return json({ message: "Passwords do not match." }, { status: 400 });
  }

  const database = await getDatabase();
  const user = {
    firstName,
    lastName,
    email,
    passwordHash: await hashPassword(password),
    createdAt: new Date(),
    ...(vehicle ? { defaultVehicle: vehicle } : {}),
  };
  try {
    const result = await database.collection("users").insertOne(user);
    const token = await createSession(database, result.insertedId);
    const jwt = createJwt(result.insertedId);
    const headers = new Headers();
    headers.append("Set-Cookie", sessionCookie(token));
    headers.append("Set-Cookie", jwtCookie(jwt));
    return json({
      message: `Account created successfully. Welcome, ${firstName}!`,
      user: publicUser({ ...user, _id: result.insertedId }),
    }, {
      status: 201,
      headers,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return json({ message: "An account with this email already exists." }, {
        status: 409,
      });
    }
    throw error;
  }
}

export async function loginUser(
  body: Record<string, unknown>,
): Promise<Response> {
  const email = typeof body.email === "string"
    ? body.email.trim().toLowerCase()
    : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!validEmail(email) || !password || password.length > 128) {
    return json({ message: "Enter a valid email address and password." }, {
      status: 400,
    });
  }
  const database = await getDatabase();
  const user = await database.collection("users").findOne({ email });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return json({ message: "Invalid email or password." }, { status: 401 });
  }
  const token = await createSession(database, user._id);
  const jwt = createJwt(user._id);
  const headers = new Headers();
  headers.append("Set-Cookie", sessionCookie(token));
  headers.append("Set-Cookie", jwtCookie(jwt));
  return json({ message: "Logged in successfully.", user: publicUser(user) }, {
    headers,
  });
}

export async function currentUser(request: Request) {
  const jwt = readJwt(request);
  const database = await getDatabase();
  if (jwt) {
    const claims = verifyJwt(jwt);
    if (claims) {
      const { ObjectId } = await import("mongodb");
      if (ObjectId.isValid(claims.sub)) {
        const user = await database.collection("users").findOne(
          { _id: new ObjectId(claims.sub) },
          { projection: { passwordHash: 0 } },
        );
        if (user) return user;
      }
    }
  }
  const token = readSessionToken(request);
  if (!token) return null;
  const session = await database.collection("sessions").findOne({
    tokenHash: hashSessionToken(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;
  return await database.collection("users").findOne(
    { _id: session.userId as ObjectId },
    { projection: { passwordHash: 0 } },
  );
}
