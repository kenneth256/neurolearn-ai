import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeuroLearn AI - Personalized Learning Platform',
  description: 'Unlock your potential with NeuroLearn AI. Personalized education, adaptive learning paths, and AI-driven insights for students and professionals.',
  openGraph: {
    title: 'NeuroLearn AI - Personalized Learning Platform',
    description: 'Unlock your potential with NeuroLearn AI. Personalized education, adaptive learning paths, and AI-driven insights for students and professionals.',
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
    title: 'NeuroLearn AI - Personalized Learning Platform',
    description: 'Unlock your potential with NeuroLearn AI. Personalized education, adaptive learning paths, and AI-driven insights for students and professionals.',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Ensure this image exists in your public folder
    creator: '@neurolearnai', // Update with your actual Twitter handle if available
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com/dashboard',
  },
  verification: {
    // google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Add your Google Search Console verification code here
    // yandex: 'YOUR_YANDEX_VERIFICATION_CODE',
    // other: {
    //   me: ['my-email@example.com', 'my-website.com'],
    // },
  },
  // WebSite Schema Markup
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "NeuroLearn AI",
        "url": "https://neurolearn-ai.onrender.com"
      }),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
