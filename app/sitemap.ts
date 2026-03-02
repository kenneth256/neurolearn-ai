import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://neurolearn-ai.onrender.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Add other static pages here, e.g.:
    // {
    //   url: 'https://neurolearn-ai.onrender.com/about',
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
    // For dynamic pages, you would fetch data and map it to sitemap entries:
    // ...
    // const posts = await getPosts();
    // ...posts.map((post) => ({
    //   url: `https://neurolearn-ai.onrender.com/blog/${post.slug}`,
    //   lastModified: post.updatedAt,
    //   changeFrequency: 'weekly',
    //   priority: 0.7,
    // })),
  ];
}
