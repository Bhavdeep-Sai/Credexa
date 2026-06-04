import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_development_only";
const JWT_EXPIRES_IN = "7d";

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

/**
 * Generate a JWT token containing the payload
 */
export function generateToken(payload: { userId: string; role: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): { userId: string; role: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; email: string };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
