import React from "react";
import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import BlogListClient from "./BlogListClient";

export const metadata: Metadata = {
  title: "Blog & Ensayos Técnicos | Alonso Ríos",
  description:
    "Pensamiento crítico sobre código, diseño y la web que perdura. Desarrollo anti-sobreingeniería, arquitectura Android nativa y SEO de alto rendimiento.",
  openGraph: {
    title: "Blog & Ensayos Técnicos | Alonso Ríos",
    description: "Ensayos prácticos sobre desarrollo web rápido, apps Android y arquitectura digital limpia.",
    url: "https://www.alonsorios.dev/blog",
    siteName: "Alonso Ríos",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  let posts: any[] = [];
  try {
    await connectToDatabase();
    const rawPosts = await BlogPost.find({ published: true }).sort({ createdAt: -1 }).lean();
    posts = rawPosts.map((p: any) => ({
      _id: p._id.toString(),
      title: p.title,
      slug: p.slug,
      content: p.content,
      excerpt: p.excerpt || "",
      coverImage: p.coverImage || "",
      category: p.category || "Desarrollo Web & Rendimiento",
      readingTime: p.readingTime || "5 min de lectura",
      featured: !!p.featured,
      telemetry: p.telemetry || null,
      createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    }));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070d19] text-white">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <BlogListClient posts={posts} />
      </main>
      <Footer />
    </div>
  );
}
