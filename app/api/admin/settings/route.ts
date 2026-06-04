import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import AdminSettings from "@/models/AdminSettings";
import SystemLog from "@/models/SystemLog";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const SettingsSchema = z.object({
  maintenanceMode: z.boolean(),
  allowedFileTypes: z.array(z.string()),
  maxFileSizeMB: z.number().min(1).max(50),
  basePrompt: z.string().min(10, "Base prompt must be descriptive"),
});

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Fetch the latest settings
    let settings = await AdminSettings.findOne().sort({ updatedAt: -1 });
    
    // Seed default settings if empty database
    if (!settings) {
      // Find any admin user to reference
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      let adminId = "000000000000000000000000"; // Fallback ID

      if (token) {
        const decoded = verifyToken(token);
        if (decoded) adminId = decoded.userId;
      }

      settings = await AdminSettings.create({
        maintenanceMode: false,
        allowedFileTypes: ["image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/wav", "audio/x-m4a", "audio/mp3", "audio/mp4"],
        maxFileSizeMB: 10,
        basePrompt: "You are Credexa AI, a specialized scam and phishing intelligence agent. Analyze the provided content (text, image OCR, or speech audio) and identify potential scams, threats, or misinformation.",
        updatedBy: adminId,
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("GET admin settings error:", error);
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

    // Parse & Validate Body
    const body = await request.json();
    const parsedData = SettingsSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { maintenanceMode, allowedFileTypes, maxFileSizeMB, basePrompt } = parsedData.data;

    // Save settings
    const settings = await AdminSettings.create({
      maintenanceMode,
      allowedFileTypes,
      maxFileSizeMB,
      basePrompt,
      updatedBy: decoded.userId,
      updatedAt: new Date(),
    });

    // Log Action
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    await SystemLog.create({
      logType: "info",
      action: "ADMIN_SETTINGS_UPDATE",
      details: `Admin settings updated by Admin ${decoded.email}. Maintenance Mode: ${maintenanceMode}`,
      userId: decoded.userId,
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, message: "System settings successfully updated.", settings });
  } catch (error) {
    console.error("PUT admin settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
