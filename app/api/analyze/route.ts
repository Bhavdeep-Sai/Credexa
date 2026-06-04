import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/db";
import Analysis from "@/models/Analysis";
import ScanHistory from "@/models/ScanHistory";
import SystemLog from "@/models/SystemLog";
import AdminSettings from "@/models/AdminSettings";
import { verifyToken } from "@/lib/auth";
import { rateLimit } from "@/lib/limiter";
import { analyzeText, analyzeUrl, analyzeScreenshot, analyzeVoiceNote } from "@/lib/gemini";
import { cookies } from "next/headers";

const AnalyzeRequestSchema = z.object({
  contentType: z.enum(["text", "url", "screenshot", "voice"]),
  content: z.string().min(1, "Content must not be empty"),
  fileType: z.string().optional(), // Required for image/audio base64
});

export async function POST(request: Request) {
  try {
    await dbConnect();

    // 1. Authenticate user if token exists (scans can be anonymous or registered)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    let userId: string | undefined = undefined;
    let role = "guest";

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
        role = decoded.role;
      }
    }

    // 2. Identify IP for Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown-ip";
    
    // Apply different limits depending on role
    // Guest: 5 scans / hour | User: 60 scans / hour | Admin: 500 scans / hour
    const limitMax = role === "admin" ? 500 : role === "user" ? 60 : 5;
    const limitWindowMs = 60 * 60 * 1000; // 1 hour

    const rateLimitResult = rateLimit(`ratelimit:${userId || ip}`, limitMax, limitWindowMs);
    if (!rateLimitResult.success) {
      // Create failure log
      await SystemLog.create({
        logType: "warn",
        action: "RATE_LIMIT_EXCEEDED",
        details: `Rate limit hit by ${role} (${userId || ip})`,
        userId,
        ipAddress: ip,
      });

      return NextResponse.json(
        {
          error: "Too many scan requests. Please wait before scanning again.",
          resetTime: rateLimitResult.reset,
        },
        { status: 429 }
      );
    }

    // 3. Parse and Validate request body
    const body = await request.json();
    const parsedData = AnalyzeRequestSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { contentType, content, fileType } = parsedData.data;

    // 4. Fetch admin settings constraints (e.g. file size, maintenance mode)
    const settings = await AdminSettings.findOne().sort({ updatedAt: -1 });
    if (settings?.maintenanceMode && role !== "admin") {
      return NextResponse.json({ error: "System is undergoing maintenance. Scans are temporarily disabled." }, { status: 503 });
    }

    // Validate size if it's an uploaded file (approximate base64 size check: 1.37x raw size)
    if (contentType === "screenshot" || contentType === "voice") {
      if (!fileType) {
        return NextResponse.json({ error: "File type must be specified for file uploads" }, { status: 400 });
      }

      // Convert approximate base64 length to MB
      const base64Length = content.length - (content.indexOf(",") + 1);
      const sizeInBytes = (base64Length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      const maxLimitMB = settings?.maxFileSizeMB || 10;

      if (sizeInMB > maxLimitMB) {
        return NextResponse.json({ error: `File size exceeds the limit of ${maxLimitMB}MB` }, { status: 400 });
      }

      // Validate allowed file types
      const allowedTypes = settings?.allowedFileTypes || [
        "image/jpeg",
        "image/png",
        "image/webp",
        "audio/mpeg",
        "audio/wav",
        "audio/x-m4a",
        "audio/mp3",
        "audio/mp4",
      ];
      if (!allowedTypes.includes(fileType)) {
        return NextResponse.json({ error: `Unsupported file format. Supported: ${allowedTypes.join(", ")}` }, { status: 400 });
      }
    }

    // 5. Invoke Gemini AI scanner based on contentType
    let result;
    try {
      if (contentType === "text") {
        result = await analyzeText(content);
      } else if (contentType === "url") {
        result = await analyzeUrl(content);
      } else if (contentType === "screenshot") {
        result = await analyzeScreenshot(content, fileType!);
      } else {
        result = await analyzeVoiceNote(content, fileType!);
      }
    } catch (aiError: any) {
      console.error("Gemini scanning failed:", aiError);
      
      await SystemLog.create({
        logType: "error",
        action: "SCAN_AI_FAILED",
        details: `AI Scan error: ${aiError.message || aiError}`,
        userId,
        ipAddress: ip,
      });

      return NextResponse.json({ error: "AI scanning service failed. Please try again." }, { status: 502 });
    }

    // 6. Save Analysis to DB
    const newAnalysis = await Analysis.create({
      userId,
      contentType,
      content: contentType === "screenshot" || contentType === "voice" ? `Uploaded File (${fileType})` : content,
      result,
    });

    // 7. Generate User History Entry if user is logged in
    if (userId) {
      let title = "";
      if (contentType === "text") {
        title = content.length > 40 ? content.slice(0, 37) + "..." : content;
      } else if (contentType === "url") {
        try {
          const parsedUrl = new URL(content.startsWith("http") ? content : `http://${content}`);
          title = `Link: ${parsedUrl.hostname}${parsedUrl.pathname.slice(0, 20)}`;
        } catch {
          title = `Link: ${content.slice(0, 30)}`;
        }
      } else if (contentType === "screenshot") {
        title = `Screenshot: ${result.category}`;
      } else {
        title = `Audio Message: ${result.category}`;
      }

      await ScanHistory.create({
        userId,
        analysisId: newAnalysis._id,
        title,
        contentType,
        riskLevel: result.riskLevel,
        category: result.category,
      });
    }

    // 8. Create Success Audit Log
    await SystemLog.create({
      logType: "info",
      action: `SCAN_${contentType.toUpperCase()}`,
      details: `Successful scanning. Category: ${result.category}. Risk: ${result.riskLevel}`,
      userId,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      analysisId: newAnalysis._id,
      contentType,
      result,
      createdAt: newAnalysis.createdAt,
    });
  } catch (error) {
    console.error("Scan processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
