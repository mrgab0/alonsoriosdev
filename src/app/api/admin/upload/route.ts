import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "GITHUB_TOKEN no est configurado en el servidor." }, { status: 500 });
    }

    const repo = "mrgab0/alonsoriosdev"; // O leer de process.env.GITHUB_REPO
    const branch = "main";
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const path = `public/blog/${timestamp}-${cleanFileName}`;

    const buffer = await file.arrayBuffer();
    const base64Content = Buffer.from(buffer).toString("base64");

    const githubApiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

    const githubRes = await fetch(githubApiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `upload: ${cleanFileName}`,
        content: base64Content,
        branch,
      }),
    });

    if (!githubRes.ok) {
      const errorData = await githubRes.text();
      console.error("GitHub API Error:", errorData);
      return NextResponse.json({ error: "Error al subir a GitHub" }, { status: 500 });
    }

    // Usar la CDN de jsDelivr para la URL pblica
    // Formato: https://cdn.jsdelivr.net/gh/user/repo@branch/path
    const publicUrl = `https://cdn.jsdelivr.net/gh/${repo}@${branch}/${path}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
