import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'NeuroLearn AI - AI-Powered Learning',
    template: '%s | NeuroLearn AI',
  },
  description: 'Unlock your potential with NeuroLearn AI\'s innovative, AI-powered learning platform for enhanced education and skill development.',
  openGraph: {
    title: 'NeuroLearn AI - AI-Powered Learning',
    description: 'Unlock your potential with NeuroLearn AI\'s innovative, AI-powered learning platform for enhanced education and skill development.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Consider replacing with your actual Open Graph image URL
        width: 1200,
        height: 630,
        alt: 'NeuroLearn AI Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuroLearn AI - AI-Powered Learning',
    description: 'Unlock your potential with NeuroLearn AI\'s innovative, AI-powered learning platform for enhanced education and skill development.',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Consider replacing with your actual Twitter Card image URL
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // IMPORTANT: Replace with your actual Google Search Console verification code
  },
  script: [
    {
      id: 'website-schema',
      type: 'application/ld+json',
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