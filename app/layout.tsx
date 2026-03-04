import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neurolearn AI - Empowering Education with AI',
  description: 'Neurolearn AI provides innovative AI-powered tools to enhance learning and teaching experiences. Discover personalized education solutions.',
  openGraph: {
    title: 'Neurolearn AI - Empowering Education with AI',
    description: 'Neurolearn AI provides innovative AI-powered tools to enhance learning and teaching experiences. Discover personalized education solutions.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'Neurolearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Placeholder: Ensure this image exists and is accessible
        width: 1200,
        height: 630,
        alt: 'Neurolearn AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neurolearn AI - Empowering Education with AI',
    description: 'Neurolearn AI provides innovative AI-powered tools to enhance learning and teaching experiences. Discover personalized education solutions.',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Placeholder: Ensure this image exists and is accessible
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Placeholder: Replace with your actual Google Search Console verification code
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  },
};