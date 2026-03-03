import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://neurolearn-ai.onrender.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/solutions`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }
    // For dynamic pages (e.g., blog posts, product pages), you would fetch them
    // from your data source (e.g., API, database) and map them to sitemap entries.
    // Example for dynamic blog posts:
    // const posts = await fetch('YOUR_API_ENDPOINT/posts').then(res => res.json());
    // ...posts.map(post => ({
    //   url: `${baseUrl}/blog/${post.slug}`,
    //   lastModified: new Date(post.updatedAt),
    //   changeFrequency: 'weekly',
    //   priority: 0.6,
    // })),
  ];
}
