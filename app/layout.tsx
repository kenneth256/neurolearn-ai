import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroLearn AI - AI-Powered Learning Platform',
  description: 'Unlock your potential with NeuroLearn AI. Personalized, adaptive learning experiences powered by artificial intelligence.',
  openGraph: {
    title: 'NeuroLearn AI - AI-Powered Learning Platform',
    description: 'Unlock your potential with NeuroLearn AI. Personalized, adaptive learning experiences powered by artificial intelligence.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg',
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
    title: 'NeuroLearn AI - AI-Powered Learning Platform',
    description: 'Unlock your potential with NeuroLearn AI. Personalized, adaptive learning experiences powered by artificial intelligence.',
    creator: '@neurolearnai',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'],
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
    languages: {
      'en-US': 'https://neurolearn-ai.onrender.com/en',
      'es-ES': 'https://neurolearn-ai.onrender.com/es',
      'x-default': 'https://neurolearn-ai.onrender.com/en'
    }
  }
};