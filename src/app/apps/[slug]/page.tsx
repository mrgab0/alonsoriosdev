import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import AppProject from "@/models/AppProject";
import { defaultApps } from "@/data/defaultApps";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AppDetailClient from "./AppDetailClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let app: any = null;

  try {
    await connectToDatabase();
    app = await AppProject.findOne({ slug, published: true }).lean();
  } catch (err) {
    console.error("Error generating metadata for app:", err);
  }

  if (!app) {
    app = defaultApps.find((a) => a.slug === slug);
  }

  if (!app) {
    return {
      title: "Aplicación no encontrada | Alonso Ríos",
    };
  }

  return {
    title: `${app.title} - ${app.platform} | Alonso Ríos`,
    description: app.tagline || app.description,
    openGraph: {
      title: `${app.title} - ${app.platform} | Alonso Ríos`,
      description: app.tagline || app.description,
      url: `https://alonsorios.dev/apps/${app.slug}`,
      siteName: "Alonso Ríos",
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function AppDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let app: any = null;

  try {
    await connectToDatabase();
    app = await AppProject.findOne({ slug, published: true }).lean();
    if (app) {
      app = {
        _id: app._id.toString(),
        title: app.title,
        slug: app.slug,
        tagline: app.tagline,
        description: app.description,
        content: app.content || "",
        icon: app.icon || "",
        version: app.version || "1.0.0",
        platform: app.platform || "Android",
        category: app.category || "Herramientas & Utilidades",
        status: app.status || "upcoming",
        githubUrl: app.githubUrl || "",
        playStoreUrl: app.playStoreUrl || "",
        downloadUrl: app.downloadUrl || "",
        privacyPolicyUrl: app.privacyPolicyUrl || "/privacy-remote-keyboard.html",
        permissions: app.permissions || [],
        features: app.features || [],
        techStack: app.techStack || [],
        createdAt: app.createdAt ? app.createdAt.toISOString() : null,
      };
    }
  } catch (error) {
    console.error("Error fetching app detail:", error);
  }

  if (!app) {
    const fallback = defaultApps.find((a) => a.slug === slug);
    if (fallback) {
      app = fallback;
    }
  }

  if (!app) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070d19] text-white">
      <Header />
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <AppDetailClient app={app} />
      </main>
      <Footer />
    </div>
  );
}
