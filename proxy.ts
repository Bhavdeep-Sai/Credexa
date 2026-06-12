import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_development_only";

// Base64Url decode utility for Edge runtime
function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Edge-compatible JWT verification
async function verifyJwtEdge(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const data = new TextEncoder().encode(`${header}.${payload}`);

    const sigBytes = base64UrlDecode(signature);
    const secretBytes = new TextEncoder().encode(secret);

    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes as any, data as any);
    if (!isValid) return null;

    const payloadStr = new TextDecoder().decode(base64UrlDecode(payload));
    const payloadObj = JSON.parse(payloadStr);

    if (payloadObj.exp && Date.now() >= payloadObj.exp * 1000) {
      return null;
    }

    return payloadObj;
  } catch (err) {
    console.error("JWT Edge verification error:", err);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define route types
  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/analyze") ||
    path.startsWith("/history") ||
    path.startsWith("/profile") ||
    path.startsWith("/settings") ||
    path.startsWith("/admin") ||
    path.startsWith("/grandparent");

  const isAuthRoute = path === "/login" || path === "/register";

  // Get token from cookies
  const token = request.cookies.get("token")?.value;

  let decodedToken = null;
  if (token) {
    decodedToken = await verifyJwtEdge(token, JWT_SECRET);
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !decodedToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users trying to access login/register to dashboard
  if (isAuthRoute && decodedToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role-based authorization for admin paths
  if (path.startsWith("/admin")) {
    if (!decodedToken || decodedToken.role !== "admin") {
      // Redirect to dashboard if not an admin
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Config to specify which paths the proxy runs on
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analyze/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/grandparent/:path*",
    "/login",
    "/register",
  ],
};
