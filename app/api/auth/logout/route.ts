import { NextResponse } from "next/server";
import SystemLog from "@/models/SystemLog";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    let userId = undefined;
    let email = "unknown";
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
        email = decoded.email;
      }
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    // Log logout audit event
    await SystemLog.create({
      logType: "info",
      action: "USER_LOGOUT",
      details: `User logged out: ${email}`,
      userId,
      ipAddress: ip,
    });

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    
    // Clear cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
