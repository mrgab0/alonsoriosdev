import React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LockedSnippet } from "@/components/LockedSnippet";
// Usamos el cliente para renderizar el markdown de forma segura
import BlogContentRenderer from "./BlogContentRenderer";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post = null;
  try {
    await connectToDatabase();
    const decodedSlug = decodeURIComponent(params.slug);
    post = await BlogPost.findOne({ slug: decodedSlug, published: true }).lean();
  } catch (error) {
    console.error("Error fetching blog post:", error);
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a1120] text-white">
      <Header />
      <main className="flex-grow w-full max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-400 text-sm font-bold">
            <span>Alonso Ríos</span>
            <span>•</span>
            <span>{post.createdAt ? format(new Date(post.createdAt), "dd de MMMM, yyyy", { locale: es }) : ""}</span>
          </div>
        </div>

        {post.coverImage && (
          <div className="mb-12 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
            <img src={post.coverImage} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
          </div>
        )}

        {/* Renderizador de Markdown que detecta y procesa los bloques de bloqueo */}
        <div className="bg-[#121b2d] rounded-3xl p-6 md:p-12 border border-gray-800 shadow-2xl">
          <BlogContentRenderer content={post.content} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
