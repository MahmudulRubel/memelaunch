import { MetadataRoute } from 'next';
import { insforge } from '@/lib/insforge';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://memelaunch.insforge.app';

  // Base routes with explicit MetadataRoute.Sitemap type
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/rules`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  try {
    // Dynamic profiles
    const { data: users } = await insforge.database
      .from('users')
      .select('id, created_at')
      .limit(100);

    if (users) {
      users.forEach((user) => {
        routes.push({
          url: `${baseUrl}/profile/${user.id}`,
          lastModified: user.created_at ? new Date(user.created_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      });
    }
  } catch (err) {
    console.error('Error generating sitemap:', err);
  }

  return routes;
}
