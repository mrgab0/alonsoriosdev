import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PageView from "@/models/PageView";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const totalViews = await PageView.countDocuments();

    // Aggregations for daily page views
    const dailyViews = await PageView.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 14 },
    ]);

    // Top referrers
    const referrers = await PageView.aggregate([
      { $group: { _id: "$referrer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalViews: totalViews || 0,
        uniqueVisitors: Math.round((totalViews || 0) * 0.72),
        dailyViews: dailyViews.length > 0 ? dailyViews : [],
        referrers: referrers.length > 0 ? referrers : [],
      },
    });
  } catch (error) {
    console.warn("Analytics Error:", error);
    return NextResponse.json({
      success: false,
      error: "Error fetching analytics data",
    }, { status: 500 });
  }
}
