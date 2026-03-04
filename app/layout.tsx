import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroLearn AI - Empowering Education with AI',
  description: 'NeuroLearn AI offers personalized learning experiences powered by artificial intelligence. Transform your education with adaptive content and smart insights.',
  openGraph: {
    title: 'NeuroLearn AI',
    description: 'Empowering Education with AI',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Placeholder: Replace with actual Open Graph image URL
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
    title: 'NeuroLearn AI',
    description: 'Empowering Education with AI',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Placeholder: Replace with actual Twitter Card image URL
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE', // Placeholder: Replace with your actual Google Search Console verification code
  },
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NeuroLearn AI',
    url: 'https://neurolearn-ai.onrender.com',
    logo: 'https://neurolearn-ai.onrender.com/logo.png', // Placeholder: Replace with actual organization logo URL
    sameAs: [
      'https://neurolearn-ai.onrender.com/dashboard'
    ],
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