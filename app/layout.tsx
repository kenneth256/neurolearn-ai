import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://neurolearn-ai.onrender.com'),
  title: {
    default: 'NeuroLearn AI - Personalized Learning & AI Tutoring',
    template: '%s | NeuroLearn AI'
  },
  description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, AI-powered tutoring, and adaptive education for all subjects.',
  openGraph: {
    title: 'NeuroLearn AI - Personalized Learning & AI Tutoring',
    description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, AI-powered tutoring, and adaptive education for all subjects.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Ensure this image exists in your public folder
        width: 1200,
        height: 630,
        alt: 'NeuroLearn AI - Personalized Learning & AI Tutoring',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuroLearn AI - Personalized Learning & AI Tutoring',
    description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, AI-powered tutoring, and adaptive education for all subjects.',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Ensure this image exists in your public folder
    creator: '@neurolearnai', // Replace with your actual Twitter handle
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE', // Replace with your actual Google Search Console verification code
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
    // Add hreflang tags here if your application supports multiple languages, e.g.:
    // languages: {
    //   'en-US': 'https://neurolearn-ai.onrender.com/en-US',
    //   'es-ES': 'https://neurolearn-ai.onrender.com/es-ES',
    // },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
