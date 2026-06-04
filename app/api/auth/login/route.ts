import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { comparePassword, generateToken } from "@/lib/auth";
import SystemLog from "@/models/SystemLog";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Input Validation
    const parsedData = LoginSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsedData.data;

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Verify Password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Create Audit Log
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await SystemLog.create({
      logType: "info",
      action: "USER_LOGIN",
      details: `User logged in: ${email}`,
      userId: user._id,
      ipAddress: ip,
    });

    // Sign JWT
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
