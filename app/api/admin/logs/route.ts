import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import SystemLog from "@/models/SystemLog";
import User from "@/models/User"; // Explicitly register User model for populate
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const logType = searchParams.get("logType") || "";

    const query: any = {};
    if (logType) {
      query.logType = logType;
    }

    // Retrieve logs, populate user details
    const logs = await SystemLog.find(query)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("GET admin logs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
