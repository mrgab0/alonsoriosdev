import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

import { crossPostToDevTo, crossPostToMedium, crossPostToHashnode, crossPostToSteem } from "@/lib/crosspost";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await connectToDatabase();

    if (id) {
      const post = await BlogPost.findById(id);
      return NextResponse.json({ success: true, data: post });
    }

    const posts = await BlogPost.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error("Blog API GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

async function handleCrossPosting(postBody: any, existingPost: any = null) {
  const { title, content, coverImage, slug, crosspostDevTo, crosspostMedium, crosspostHashnode, crosspostSteem } = postBody;
  
  // Solamente crosspostear si est marcado
  if (!crosspostDevTo && !crosspostMedium && !crosspostHashnode && !crosspostSteem) return {};

  const canonicalUrl = `https://alonsorios.dev/blog/${slug}`;
  const updates: any = {};

  if (crosspostDevTo && (!existingPost || !existingPost.devtoUrl)) {
    try {
      const devtoToken = process.env.DEVTO_TOKEN;
      if (devtoToken) {
        const url = await crossPostToDevTo(title, content, coverImage, canonicalUrl, devtoToken);
        updates.devtoUrl = url;
      }
    } catch (err: any) {
      console.error("DevTo Crosspost error:", err.message);
    }
  }

  if (crosspostMedium && (!existingPost || !existingPost.mediumUrl)) {
    try {
      const mediumToken = process.env.MEDIUM_TOKEN;
      if (mediumToken) {
        const url = await crossPostToMedium(title, content, canonicalUrl, mediumToken);
        updates.mediumUrl = url;
      }
    } catch (err: any) {
      console.error("Medium Crosspost error:", err.message);
    }
  }

  if (crosspostHashnode && (!existingPost || !existingPost.hashnodeUrl)) {
    try {
      const hashnodeToken = process.env.HASHNODE_TOKEN;
      const hashnodePubId = process.env.HASHNODE_PUBLICATION_ID;
      if (hashnodeToken && hashnodePubId) {
        const url = await crossPostToHashnode(title, content, coverImage, canonicalUrl, hashnodeToken, hashnodePubId);
        updates.hashnodeUrl = url;
      }
    } catch (err: any) {
      console.error("Hashnode Crosspost error:", err.message);
    }
  }

  if (crosspostSteem && (!existingPost || !existingPost.steemUrl)) {
    try {
      const steemToken = process.env.STEEM_TOKEN;
      const steemUser = process.env.STEEM_USERNAME;
      if (steemToken && steemUser) {
        const url = await crossPostToSteem(title, content, canonicalUrl, steemUser, steemToken);
        updates.steemUrl = url;
      }
    } catch (err: any) {
      console.error("Steem Crosspost error:", err.message);
    }
  }

  return updates;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    // Auto-generate slug if empty
    if (!body.slug) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const crossPostUrls = await handleCrossPosting(body);
    const postData = { ...body, ...crossPostUrls };

    const newPost = await BlogPost.create(postData);
    return NextResponse.json({ success: true, data: newPost });
  } catch (error: any) {
    console.error("Blog API POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;
    
    if (!_id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const existingPost = await BlogPost.findById(_id);
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    updateData.updatedAt = new Date();
    
    const crossPostUrls = await handleCrossPosting(body, existingPost);
    const finalUpdateData = { ...updateData, ...crossPostUrls };
    
    const updatedPost = await BlogPost.findByIdAndUpdate(_id, finalUpdateData, { new: true });
    return NextResponse.json({ success: true, data: updatedPost });
  } catch (error: any) {
    console.error("Blog API PUT Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    await BlogPost.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Blog API DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
