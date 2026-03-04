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
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Neurolearn AI',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 main street',
      addressLocality: 'California',
      addressRegion: 'CA',
      addressCountry: 'US',
    },
    url: 'https://neurolearn-ai.onrender.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
