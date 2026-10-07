import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  let posts: any[] = [];
  try {
    await connectToDatabase();
    posts = await BlogPost.find({ published: true }).sort({ createdAt: -1 }).lean();
  } catch (error) {
    console.error("Error fetching blog posts:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a1120] text-white">
      <Header />
      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-black text-amber-400 mb-4">Blog & Recursos</h1>
        <p className="text-lg text-gray-300 mb-12">
          Artículos, tutoriales y guías sobre desarrollo web, apps móviles y emprendimiento tech.
        </p>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            Aún no hay artículos publicados. ¡Vuelve pronto!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post: any) => (
              <Link href={`/blog/${post.slug}`} key={post._id.toString()}>
                <div className="bg-[#121b2d] border border-gray-800 rounded-2xl overflow-hidden hover:border-amber-400/50 transition group h-full flex flex-col">
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                    />
                  )}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition">
                        {post.title}
                      </h2>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="text-amber-400/80 text-xs font-bold mt-4">
                      {post.createdAt ? format(new Date(post.createdAt), "dd MMM yyyy", { locale: es }) : ""}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
