import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import SystemLog from "@/models/SystemLog";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const UpdateRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["user", "admin"]),
});

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Authenticate Admin
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("GET admin users error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();

    // Authenticate Admin
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse Body
    const body = await request.json();
    const parsedData = UpdateRoleSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: "Invalid payload details" }, { status: 400 });
    }

    const { userId, role } = parsedData.data;

    // Prevent Admin self-demotion
    if (userId === decoded.userId) {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    // Log Action
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await SystemLog.create({
      logType: "info",
      action: "ADMIN_ROLE_CHANGE",
      details: `Role updated for ${targetUser.email} from ${oldRole} to ${role} by Admin ${decoded.email}`,
      userId: decoded.userId,
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, message: `User role successfully updated to ${role}.` });
  } catch (error) {
    console.error("PUT admin user role error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();

    // Authenticate Admin
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Extract user ID from URL query
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID parameter is required" }, { status: 400 });
    }

    // Prevent Admin self-deletion
    if (userId === decoded.userId) {
      return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await User.findByIdAndDelete(userId);

    // Log Action
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await SystemLog.create({
      logType: "warn",
      action: "ADMIN_USER_DELETE",
      details: `User account deleted: ${userToDelete.email} by Admin ${decoded.email}`,
      userId: decoded.userId,
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, message: "User account successfully deleted." });
  } catch (error) {
    console.error("DELETE admin user error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
