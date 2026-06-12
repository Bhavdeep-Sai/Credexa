import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { hashPassword, generateToken } from "@/lib/auth";
import SystemLog from "@/models/SystemLog";

// Register validation schema
const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Input Validation
    const parsedData = RegisterSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsedData.data;

    // Check if user exists (normalize email lookup)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    // Hash Password
    const hashedPassword = await hashPassword(password);

    // Create User
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user", // Default role
      profilePicture: "",
    });

    // Create Audit Log
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await SystemLog.create({
      logType: "info",
      action: "USER_REGISTRATION",
      details: `User registered: ${email}`,
      userId: newUser._id,
      ipAddress: ip,
    });

    // Sign JWT
    const token = generateToken({
      userId: newUser._id.toString(),
      role: newUser.role,
      email: newUser.email,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          profilePicture: newUser.profilePicture,
        },
      },
      { status: 201 }
    );

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
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
