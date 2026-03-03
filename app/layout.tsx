import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroLearn AI - Master AI & Machine Learning',
  description: 'Unlock your potential with NeuroLearn AI. Comprehensive courses, cutting-edge tools, and expert guidance in AI and machine learning.',
  openGraph: {
    title: 'NeuroLearn AI - Master AI & Machine Learning',
    description: 'Unlock your potential with NeuroLearn AI. Comprehensive courses, cutting-edge tools, and expert guidance in AI and machine learning.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Placeholder: Ensure this image exists
        width: 1200,
        height: 630,
        alt: 'NeuroLearn AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuroLearn AI - Master AI & Machine Learning',
    description: 'Unlock your potential with NeuroLearn AI. Comprehensive courses, cutting-edge tools, and expert guidance in AI and machine learning.',
    creator: '@neurolearnai', // Placeholder: Update with actual Twitter handle if available
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Placeholder: Ensure this image exists
  },
  // JSON-LD Schema Markup for Organization
  // This addresses the 'local-directories' issue by providing structured data about the organization
  // and its presence in online 'directories' (social media, etc.) via the 'sameAs' property.
  // It helps search engines understand the entity and potentially populate knowledge panels,
  // which is the closest equivalent for an online business to 'local directories' or 'Wikipedia Infobox'.
  scripts: [
    {
      type: 'application/ld+json',
      id: 'organization-schema',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "NeuroLearn AI",
        "url": "https://neurolearn-ai.onrender.com",
        "logo": "https://neurolearn-ai.onrender.com/logo.png", // Placeholder: Ensure this path is correct and image exists
        "sameAs": [
          "https://www.facebook.com/neurolearnai", // Placeholder: Update with actual Facebook page URL
          "https://twitter.com/neurolearnai",     // Placeholder: Update with actual Twitter profile URL
          "https://www.linkedin.com/company/neurolearnai", // Placeholder: Update with actual LinkedIn company page URL
          "https://www.instagram.com/neurolearnai", // Placeholder: Update with actual Instagram profile URL
          // "https://en.wikipedia.org/wiki/NeuroLearn_AI" // Uncomment and update if a Wikipedia page for NeuroLearn AI exists
        ]
      }),
    },
  ],
};
