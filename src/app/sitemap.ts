import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import AppProject from '@/models/AppProject';

const BASE_URL = 'https://www.alonsorios.dev';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rutas estáticas con prioridad
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/apps`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/herramientas/creador-qr-pago-movil`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/herramientas/creador-qr-dinamico`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/herramientas/creador-qr-estatico`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/roadmap`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy-remote-keyboard`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Rutas dinámicas de Blog
  let blogRoutes: MetadataRoute.Sitemap = [];
  let appRoutes: MetadataRoute.Sitemap = [];

  try {
    await connectToDatabase();

    // Posts publicados
    const posts = await BlogPost.find({ published: true })
      .select('slug updatedAt createdAt')
      .lean();

    blogRoutes = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.createdAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Apps publicadas
    const apps = await AppProject.find({ status: { $ne: 'archived' } })
      .select('slug updatedAt createdAt')
      .lean();

    appRoutes = apps.map((app) => ({
      url: `${BASE_URL}/apps/${app.slug}`,
      lastModified: new Date(app.updatedAt || app.createdAt || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  } catch {
    // Si la BD falla, devolver solo las rutas estáticas
  }

  return [...staticRoutes, ...blogRoutes, ...appRoutes];
}
