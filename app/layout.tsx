import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeuroLearn AI - Personalized Learning & AI Tutoring',
  description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, AI-powered tutoring, and adaptive education for students and professionals.',
  openGraph: {
    title: 'NeuroLearn AI - Personalized Learning & AI Tutoring',
    description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, AI-powered tutoring, and adaptive education for students and professionals.',
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
    title: 'NeuroLearn AI - Personalized Learning & AI Tutoring',
    description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, AI-powered tutoring, and adaptive education for students and professionals.',
    creator: '@neurolearnai',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'],
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE', // Replace with your actual Google Search Console verification code
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
    languages: {
      'en-US': 'https://neurolearn-ai.onrender.com',
      'en': 'https://neurolearn-ai.onrender.com',
      'x-default': 'https://neurolearn-ai.onrender.com',
    },
  },
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
