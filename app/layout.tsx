import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroLearn AI - AI-Powered Learning Platform',
  description: 'Unlock your potential with NeuroLearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey and enhance your learning experience.',

  openGraph: {
    title: 'NeuroLearn AI - AI-Powered Learning Platform',
    description: 'Unlock your potential with NeuroLearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey and enhance your learning experience.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NeuroLearn AI - AI-Powered Learning',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'NeuroLearn AI - AI-Powered Learning Platform',
    description: 'Unlock your potential with NeuroLearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey and enhance your learning experience.',
    creator: '@NeuroLearnAI',
    site: '@NeuroLearnAI',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'],
  },

  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE',
  },

  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  },

  script: [
    {
      type: 'application/ld+json',
      id: 'organization-schema',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "NeuroLearn AI",
        "url": "https://neurolearn-ai.onrender.com",
        "logo": "https://neurolearn-ai.onrender.com/logo.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+256775260196",
          "contactType": "customer service",
          "email": "kennethdavid256@gmail.com"
        },
        "sameAs": []
      }),
    },
    {
      type: 'application/ld+json',
      id: 'website-schema',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "NeuroLearn AI",
        "url": "https://neurolearn-ai.onrender.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://neurolearn-ai.onrender.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }),
    },
  ],
};