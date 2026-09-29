import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    // Obtener todos los artículos públicos, ordenados del más reciente al más antiguo
    const posts = await BlogPost.find({ published: true }).sort({ createdAt: -1 });

    const site_url = 'https://alonsorios.dev';

    let rssItemsXml = '';

    posts.forEach((post) => {
      const postUrl = `${site_url}/blog/${post.slug}`;
      const pubDate = new Date(post.createdAt || new Date()).toUTCString();
      
      // IFTTT y otros lectores RSS pueden extraer imágenes de CDATA o de la etiqueta <enclosure>
      const imageTag = post.coverImage 
        ? `<enclosure url="${post.coverImage}" type="image/jpeg" length="0" />`
        : '';

      rssItemsXml += `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${postUrl}</link>
          <guid isPermaLink="true">${postUrl}</guid>
          <pubDate>${pubDate}</pubDate>
          <description><![CDATA[${post.excerpt}]]></description>
          ${imageTag}
        </item>
      `;
    });

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>Alonso Ríos - Software & Business</title>
          <link>${site_url}</link>
          <description>Desarrollo de Software, Negocios y Tecnología por Alonso Ríos</description>
          <language>es</language>
          <atom:link href="${site_url}/rss.xml" rel="self" type="application/rss+xml" />
          ${rssItemsXml}
        </channel>
      </rss>
    `;

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'text/xml',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate', // Cache de 24 horas
      },
    });
  } catch (error) {
    console.error('Error generando RSS Feed:', error);
    return new NextResponse('Error generando el RSS feed', { status: 500 });
  }
}
