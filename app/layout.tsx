import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neurolearn AI | Empowering Education with Intelligent Tools',
  description: 'Unlock your potential with Neurolearn AI. We provide cutting-edge AI tools to enhance learning, boost productivity, and personalize your educational journey.',
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  },
  openGraph: {
    title: 'Neurolearn AI | Empowering Education with Intelligent Tools',
    description: 'Unlock your potential with Neurolearn AI. We provide cutting-edge AI tools to enhance learning, boost productivity, and personalize your educational journey.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'Neurolearn AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Neurolearn AI | Empowering Education with Intelligent Tools',
    description: 'Unlock your potential with Neurolearn AI. We provide cutting-edge AI tools to enhance learning, boost productivity, and personalize your educational journey.',
  },
};

import { ThemeProvider, ThemeScript } from '@/app/components/ui/theme';

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Neurolearn AI',
    url: 'https://neurolearn-ai.onrender.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://neurolearn-ai.onrender.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Neurolearn AI',
    url: 'https://neurolearn-ai.onrender.com',
    sameAs: [
      'https://twitter.com/neurolearnai',
      'https://github.com/neurolearnai',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 main street',
      addressLocality: 'California',
      addressRegion: 'CA',
      addressCountry: 'US',
    },
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
