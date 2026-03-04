import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroLearn AI - Personalized Learning & AI Tutoring',
  description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, AI-powered tutoring, and adaptive education for all ages and subjects.',
  openGraph: {
    title: 'NeuroLearn AI - Personalized Learning & AI Tutoring',
    description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, AI-powered tutoring, and adaptive education for all ages and subjects.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Ensure this image exists in your public folder
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
    title: 'NeuroLearn AI - Personalized Learning & AI Tutoring',
    description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, AI-powered tutoring, and adaptive education for all ages and subjects.',
    creator: '@NeuroLearnAI', // Replace with actual Twitter handle if available
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Ensure this image exists in your public folder
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE', // Replace with your actual Google Search Console verification code
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  },
};
