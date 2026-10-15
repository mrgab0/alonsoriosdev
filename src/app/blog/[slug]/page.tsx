import React from "react";
import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

  try {
    await connectToDatabase();
    const post = await BlogPost.findOne({ slug: decodedSlug, published: true }).lean();
    if (post) {
      return {
        title: `${(post as any).title} | Blog Alonso Ríos`,
        description:
          (post as any).excerpt ||
          (post as any).content.replace(/[#*`_\[\]()]/g, "").substring(0, 160) + "...",
        openGraph: {
          title: (post as any).title,
          description: (post as any).excerpt,
          url: `https://www.alonsorios.dev/blog/${(post as any).slug}`,
          siteName: "Alonso Ríos",
          type: "article",
        },
      };
    }
  } catch (e) {
    // Fallback
  }

  return {
    title: "Artículo | Blog Alonso Ríos",
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  let post = null;
  let prevPost = null;
  let nextPost = null;

  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const decodedSlug = decodeURIComponent(resolvedParams.slug);
    post = await BlogPost.findOne({ slug: decodedSlug, published: true }).lean();

    if (post) {
      // Find previous and next published posts
      const prev = await BlogPost.findOne({
        published: true,
        createdAt: { $lt: (post as any).createdAt },
      })
        .sort({ createdAt: -1 })
        .select("title slug category")
        .lean();

      const next = await BlogPost.findOne({
        published: true,
        createdAt: { $gt: (post as any).createdAt },
      })
        .sort({ createdAt: 1 })
        .select("title slug category")
        .lean();

      if (prev) {
        prevPost = { title: (prev as any).title, slug: (prev as any).slug, category: (prev as any).category };
      }
      if (next) {
        nextPost = { title: (next as any).title, slug: (next as any).slug, category: (next as any).category };
      }
    }
  } catch (error) {
    console.error("Error fetching blog post:", error);
  }

  if (!post) {
    notFound();
  }

  const serializedPost = {
    _id: (post as any)._id.toString(),
    title: (post as any).title,
    slug: (post as any).slug,
    content: (post as any).content,
    excerpt: (post as any).excerpt || "",
    coverImage: (post as any).coverImage || "",
    category: (post as any).category || "Desarrollo Web & Rendimiento",
    readingTime: (post as any).readingTime || "8 min de lectura",
    featured: !!(post as any).featured,
    telemetry: (post as any).telemetry || null,
    createdAt: (post as any).createdAt ? (post as any).createdAt.toISOString() : null,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070d19] text-white">
      <Header />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BlogPostClient post={serializedPost} prevPost={prevPost} nextPost={nextPost} />
      </main>
      <Footer />
    </div>
  );
}
