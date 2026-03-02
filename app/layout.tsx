import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroLearn AI: Personalized Learning Platform for Enhanced Education',
  description: 'NeuroLearn AI: Personalized learning platform powered by advanced AI. Adapts to your unique style and pace, optimizing your educational journey for enhanced academic success.',
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
    // If multiple languages were supported, hreflang would go here:
    // hreflang: {
    //   'en-US': 'https://neurolearn-ai.onrender.com/en-US',
    //   'x-default': 'https://neurolearn-ai.onrender.com',
    // },
  },
  openGraph: {
    title: 'NeuroLearn AI: Personalized Learning Platform for Enhanced Education',
    description: 'NeuroLearn AI: Personalized learning platform powered by advanced AI. Adapts to your unique style and pace, optimizing your educational journey for enhanced academic success.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Ensure this image exists in your public directory
        width: 1200,
        height: 630,
        alt: 'NeuroLearn AI - Personalized Learning Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuroLearn AI: Personalized Learning Platform for Enhanced Education',
    description: 'NeuroLearn AI: Personalized learning platform powered by advanced AI. Adapts to your unique style and pace, optimizing your educational journey for enhanced academic success.',
    creator: '@NeuroLearnAI', // Replace with your actual Twitter handle
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Ensure this image exists in your public directory
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Replace with your actual Google Search Console verification code
    // Other verification tags can be added here if needed (e.g., yandex, bing)
  },
};
