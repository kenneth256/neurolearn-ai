import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroLearn AI - Revolutionizing Education with AI',
  description: 'NeuroLearn AI leverages cutting-edge artificial intelligence to personalize learning experiences, making education more accessible and effective for everyone.',
  openGraph: {
    title: 'NeuroLearn AI - Revolutionizing Education with AI',
    description: 'NeuroLearn AI leverages cutting-edge artificial intelligence to personalize learning experiences, making education more accessible and effective for everyone.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Placeholder: Ensure this image exists and is optimized
        width: 1200,
        height: 630,
        alt: 'NeuroLearn AI - Revolutionizing Education',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuroLearn AI - Revolutionizing Education with AI',
    description: 'NeuroLearn AI leverages cutting-edge artificial intelligence to personalize learning experiences, making education more accessible and effective for everyone.',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Placeholder: Ensure this image exists and is optimized
    creator: '@NeuroLearnAI', // Placeholder: Replace with actual Twitter handle if available
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  }
};