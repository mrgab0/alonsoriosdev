import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import PageView from "@/models/PageView";
import Contact from "@/models/Contact";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get("since");
    const sinceDate = sinceParam ? new Date(parseInt(sinceParam, 10)) : new Date(Date.now() - 30 * 60 * 1000);

    // 1. Fetch recent PageViews
    const recentViews = await PageView.find({
      timestamp: { $gt: sinceDate },
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // 2. Fetch recent Contacts / Leads
    const recentContacts = await Contact.find({
      createdAt: { $gt: sinceDate },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 3. Format telemetry events
    const events: Array<{
      id: string;
      type: "social_visit" | "direct_visit" | "new_contact";
      title: string;
      detail: string;
      timestamp: Date;
    }> = [];

    for (const contact of recentContacts as any[]) {
      events.push({
        id: `c-${contact._id}`,
        type: "new_contact",
        title: "📩 Nuevo cliente potencial",
        detail: `${contact.name} (${contact.email}) escribió sobre: "${contact.serviceType}"`,
        timestamp: contact.createdAt,
      });
    }

    for (const view of recentViews as any[]) {
      const ref = (view.referrer || "").toLowerCase();
      const isSocial =
        ref.includes("linkedin") ||
        ref.includes("t.co") ||
        ref.includes("twitter") ||
        ref.includes("x.com") ||
        ref.includes("instagram") ||
        ref.includes("facebook") ||
        ref.includes("reddit") ||
        ref.includes("github") ||
        ref.includes("google");

      const sourceName = isSocial
        ? ref.includes("linkedin")
          ? "LinkedIn"
          : ref.includes("t.co") || ref.includes("twitter") || ref.includes("x.com")
          ? "X (Twitter)"
          : ref.includes("instagram")
          ? "Instagram"
          : ref.includes("facebook")
          ? "Facebook"
          : ref.includes("github")
          ? "GitHub"
          : ref.includes("google")
          ? "Google Search"
          : ref
        : "Tráfico Directo";

      events.push({
        id: `v-${view._id}`,
        type: isSocial ? "social_visit" : "direct_visit",
        title: isSocial ? `🌐 Visita desde ${sourceName}` : "👀 Visita a la web",
        detail: `Navegando en: ${view.path} (${sourceName})`,
        timestamp: view.timestamp,
      });
    }

    // Sort combined events descending
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      events: events.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Error al obtener telemetría" }, { status: 500 });
  }
}
