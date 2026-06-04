import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ScanHistory from "@/models/ScanHistory";
import Analysis from "@/models/Analysis";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, props: RouteParams) {
  try {
    const { id } = await props.params;
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

    // Find the ScanHistory entry
    const historyItem = await ScanHistory.findOne({
      _id: id,
      userId: decoded.userId,
    });

    if (!historyItem) {
      return NextResponse.json({ error: "History item not found" }, { status: 404 });
    }

    // Find the associated full Analysis report
    const analysis = await Analysis.findById(historyItem.analysisId);
    if (!analysis) {
      return NextResponse.json({ error: "Scanned analysis details not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      historyItem,
      analysis,
    });
  } catch (error) {
    console.error("GET individual history error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  try {
    const { id } = await props.params;
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

    // Find and delete the ScanHistory entry
    const deletedItem = await ScanHistory.findOneAndDelete({
      _id: id,
      userId: decoded.userId,
    });

    if (!deletedItem) {
      return NextResponse.json({ error: "History item not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "History entry successfully deleted.",
    });
  } catch (error) {
    console.error("DELETE individual history error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
