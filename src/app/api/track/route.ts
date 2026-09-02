import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PageView from "@/models/PageView";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { path = "/", referrer = "direct" } = body;
    const userAgent = request.headers.get("user-agent") || "unknown";

    try {
      await connectToDatabase();
      await PageView.create({
        path,
        referrer,
        userAgent,
        timestamp: new Date(),
      });
    } catch {
      // Dev mode fallback
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
