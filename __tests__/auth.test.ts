import { hashPassword, comparePassword, generateToken, verifyToken } from "../lib/auth";

describe("Authentication Utilities", () => {
  const password = "mySecurePassword123";
  const email = "user@test.com";
  const userId = "user_123456789";
  const role = "user";

  test("should correctly hash and verify password", async () => {
    const hashed = await hashPassword(password);
    expect(hashed).toBeDefined();
    expect(hashed).not.toEqual(password);

    const isMatch = await comparePassword(password, hashed);
    expect(isMatch).toBe(true);

    const isMismatch = await comparePassword("wrongPassword", hashed);
    expect(isMismatch).toBe(false);
  });

  test("should sign and verify JWT tokens", () => {
    const payload = { userId, role, email };
    const token = generateToken(payload);
    expect(token).toBeDefined();

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toEqual(userId);
    expect(decoded?.role).toEqual(role);
    expect(decoded?.email).toEqual(email);
  });

  test("should return null for invalid or expired tokens", () => {
    const decoded = verifyToken("invalid.token.signature");
    expect(decoded).toBeNull();
  });
});
