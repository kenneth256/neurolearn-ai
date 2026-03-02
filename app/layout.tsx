import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroLearn AI | AI-Powered Learning & Cognitive Enhancement',
  description: 'Unlock your full potential with NeuroLearn AI. Personalized AI-driven learning experiences designed to enhance cognitive abilities, memory, and focus.',
  openGraph: {
    title: 'NeuroLearn AI | AI-Powered Learning & Cognitive Enhancement',
    description: 'Unlock your full potential with NeuroLearn AI. Personalized AI-driven learning experiences designed to enhance cognitive abilities, memory, and focus.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/social-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NeuroLearn AI Social Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuroLearn AI | AI-Powered Learning & Cognitive Enhancement',
    description: 'Unlock your full potential with NeuroLearn AI. Personalized AI-driven learning experiences designed to enhance cognitive abilities, memory, and focus.',
    images: ['https://neurolearn-ai.onrender.com/social-image.jpg'],
    creator: '@neurolearnai',
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  },
  // verification: {
  //   google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  //   yandex: 'YOUR_YANDEX_VERIFICATION_CODE',
  //   bing: 'YOUR_BING_VERIFICATION_CODE',
  //   // baidu: 'YOUR_BAIDU_VERIFICATION_CODE',
  // },
};
