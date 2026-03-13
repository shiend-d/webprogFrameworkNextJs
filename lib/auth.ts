import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";

export type AdminTokenPayload = {
  id: number;
  username: string;
  role: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    // Local development fallback to prevent auth API from crashing when .env is missing.
    return "dasasena-dev-jwt-secret-change-me";
  }

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return secret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "1d" });
}

export function verifyToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (typeof decoded === "string") {
      return null;
    }

    const parsed = decoded as JwtPayload & Partial<AdminTokenPayload>;

    if (
      typeof parsed.id !== "number" ||
      typeof parsed.username !== "string" ||
      typeof parsed.role !== "string"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      username: parsed.username,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}
