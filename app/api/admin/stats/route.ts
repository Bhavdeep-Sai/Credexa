import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Analysis from "@/models/Analysis";
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

    // 1. Total User Counts
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "admin" });
    const userCount = totalUsers - adminCount;

    // 2. Scan Statistics
    const totalScans = await Analysis.countDocuments();

    // 3. Risk Level Distribution (Aggregation)
    const riskLevels = await Analysis.aggregate([
      {
        $group: {
          _id: "$result.riskLevel",
          count: { $sum: 1 },
        },
      },
    ]);

    const riskDistribution = {
      Safe: 0,
      Suspicious: 0,
      Dangerous: 0,
    };

    riskLevels.forEach((level) => {
      if (level._id === "Safe") riskDistribution.Safe = level.count;
      if (level._id === "Suspicious") riskDistribution.Suspicious = level.count;
      if (level._id === "Dangerous") riskDistribution.Dangerous = level.count;
    });

    // 4. Scans Over Time - Last 6 Months (Aggregation)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of month

    const scansTimeline = await Analysis.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Fill timeline with zeros for months without data
    const timelineData = [];
    const tempDate = new Date(sixMonthsAgo);
    
    for (let i = 0; i < 6; i++) {
      const year = tempDate.getFullYear();
      const month = tempDate.getMonth() + 1; // JS months are 0-indexed, MongoDB are 1-indexed
      
      const found = scansTimeline.find((item) => item._id.year === year && item._id.month === month);
      
      timelineData.push({
        month: `${monthNames[month - 1]} ${year}`,
        scans: found ? found.count : 0,
      });
      
      tempDate.setMonth(tempDate.getMonth() + 1);
    }

    // 5. Popular Scam Categories
    const categoriesTimeline = await Analysis.aggregate([
      {
        $group: {
          _id: "$result.category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const popularCategories = categoriesTimeline.map((item) => ({
      category: item._id,
      count: item.count,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          admins: adminCount,
          users: userCount,
        },
        scans: {
          total: totalScans,
          riskDistribution,
          popularCategories,
          timeline: timelineData,
        },
      },
    });
  } catch (error) {
    console.error("GET admin stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
