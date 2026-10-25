import React from "react";
import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import AppProject from "@/models/AppProject";
import { defaultApps } from "@/data/defaultApps";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AppsListClient from "./AppsListClient";

export const metadata: Metadata = {
  title: "Apps Android & Software | Alonso Ríos",
  description:
    "Aplicaciones nativas para Android y herramientas de software creadas por Alonso Ríos. Enfoque absoluto en privacidad, 100% comunicación local, cero publicidad y cero telemetría.",
  openGraph: {
    title: "Apps Android & Software | Alonso Ríos",
    description:
      "Explora las aplicaciones desarrolladas por Alonso Ríos, incluyendo Remote WiFi Keyboard. Software ligero, sin rastreadores y enfocado en la productividad real.",
    url: "https://alonsorios.dev/apps",
    siteName: "Alonso Ríos",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function AppsIndexPage() {
  let apps: any[] = [];
  try {
    await connectToDatabase();
    const rawApps = await AppProject.find({ published: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    if (rawApps && rawApps.length > 0) {
      apps = rawApps.map((a: any) => ({
        _id: a._id.toString(),
        title: a.title,
        slug: a.slug,
        tagline: a.tagline,
        description: a.description,
        icon: a.icon || "",
        version: a.version || "1.0.0",
        platform: a.platform || "Android",
        category: a.category || "Herramientas & Utilidades",
        status: a.status || "upcoming",
        githubUrl: a.githubUrl || "",
        playStoreUrl: a.playStoreUrl || "",
        downloadUrl: a.downloadUrl || "",
        privacyPolicyUrl: a.privacyPolicyUrl || "/privacy-remote-keyboard.html",
        features: a.features || [],
        techStack: a.techStack || [],
        featured: !!a.featured,
      }));
    } else {
      apps = defaultApps;
    }
  } catch (error) {
    console.error("Error al cargar aplicaciones en AppsIndexPage:", error);
    apps = defaultApps;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070d19] text-white">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <AppsListClient apps={apps} />
      </main>
      <Footer />
    </div>
  );
}
