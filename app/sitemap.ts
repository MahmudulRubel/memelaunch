import { MetadataRoute } from 'next';
import { insforge } from '@/lib/insforge';
import { BLOG_POSTS } from '@/lib/blog-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://memelaunch.insforge.app';

  // Core static pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/world-cup`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rules`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Add Blog Posts dynamically
  BLOG_POSTS.forEach((post) => {
    routes.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  try {
    // Dynamic product launch pages for SEO & AEO indexing
    const { data: launches } = await insforge.database
      .from('launches')
      .select('product_name, created_at')
      .eq('is_approved', true)
      .limit(200);

    if (launches) {
      launches.forEach((launch) => {
        if (launch.product_name) {
          routes.push({
            url: `${baseUrl}/products/${encodeURIComponent(launch.product_name)}`,
            lastModified: launch.created_at ? new Date(launch.created_at) : new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          });
        }
      });
    }

    // Dynamic user profiles
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
          priority: 0.5,
        });
      });
    }
  } catch (err) {
    console.error('Error generating sitemap:', err);
  }

  return routes;
}
