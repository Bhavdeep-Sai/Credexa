import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ScanHistory from "@/models/ScanHistory";
import Analysis from "@/models/Analysis"; // Explicitly register Analysis model for populate
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Authenticate User
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const riskLevel = searchParams.get("riskLevel") || "";
    const contentType = searchParams.get("contentType") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Build Mongoose query
    const query: any = { userId: decoded.userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    if (contentType) {
      query.contentType = contentType;
    }

    // Fetch entries
    const items = await ScanHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("analysisId");

    const total = await ScanHistory.countDocuments(query);

    return NextResponse.json({
      success: true,
      history: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET history error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message, 
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    
    // Authenticate User
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all scan history for the user
    const result = await ScanHistory.deleteMany({ userId: decoded.userId });

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} scan history items.`,
    });
  } catch (error) {
    console.error("DELETE history error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
