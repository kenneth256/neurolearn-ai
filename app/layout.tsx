import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Neurolearn AI - AI-Powered Learning Platform',
    template: '%s | Neurolearn AI',
  },
  description: 'Unlock your potential with Neurolearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey. Master new skills, understand complex concepts, and achieve your educational goals efficiently.',
  openGraph: {
    title: 'Neurolearn AI - AI-Powered Learning Platform',
    description: 'Unlock your potential with Neurolearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey. Master new skills, understand complex concepts, and achieve your educational goals efficiently.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'Neurolearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Placeholder: Ensure this image exists in your public directory
        width: 1200,
        height: 630,
        alt: 'Neurolearn AI Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neurolearn AI - AI-Powered Learning Platform',
    description: 'Unlock your potential with Neurolearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey. Master new skills, understand complex concepts, and achieve your educational goals efficiently.',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Placeholder: Ensure this image exists in your public directory
    creator: '@neurolearnai', // Placeholder: Replace with your actual Twitter handle
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  },
  // verification: {
  //   google: 'your-google-verification-code', // Uncomment and replace with your Google Search Console verification code
  //   yandex: 'your-yandex-verification-code',
  //   baidu: 'your-baidu-verification-code',
  //   facebook: 'your-facebook-verification-code',
  // },
  // alternates: {
  //   canonical: 'https://neurolearn-ai.onrender.com',
  //   languages: {
  //     'en-US': 'https://neurolearn-ai.onrender.com/en-US',
  //     'es-ES': 'https://neurolearn-ai.onrender.com/es-ES',
  //   },
  // },
};
