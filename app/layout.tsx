import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroLearn AI: Personalized Learning & Cognitive Enhancement',
  description: 'NeuroLearn AI offers personalized learning and cognitive enhancement. Our AI adapts to your unique style, optimizing brain function for improved memory, focus, and problem-solving.',
  openGraph: {
    title: 'NeuroLearn AI: Personalized Learning & Cognitive Enhancement',
    description: 'NeuroLearn AI offers personalized learning and cognitive enhancement. Our AI adapts to your unique style, optimizing brain function for improved memory, focus, and problem-solving.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Placeholder: Update with actual Open Graph image URL
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
    title: 'NeuroLearn AI: Personalized Learning & Cognitive Enhancement',
    description: 'NeuroLearn AI offers personalized learning and cognitive enhancement. Our AI adapts to your unique style, optimizing brain function for improved memory, focus, and problem-solving.',
    creator: '@neurolearnai', // Placeholder: Update with actual Twitter handle
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Placeholder: Update with actual Twitter Card image URL
  },
  verification: {
    google: 'your-google-site-verification-code', // Placeholder: Update with your actual Google Search Console verification code
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
    // hreflang: {
    //   'en-US': 'https://neurolearn-ai.onrender.com',
    //   'x-default': 'https://neurolearn-ai.onrender.com',
    // }, // Uncomment and configure for internationalization if applicable
  },
};
