import type { Metadata } from 'next';

export const metadata: Metadata = {
  script: [
    {
      id: 'website-schema',
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "NeuroLearn-Ai",
        "url": "https://neurolearn-ai.onrender.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://neurolearn-ai.onrender.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }),
    },
  ],
};