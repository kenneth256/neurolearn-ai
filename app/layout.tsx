import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeuroLearn AI - Revolutionizing Education with AI',
  description: 'NeuroLearn AI provides cutting-edge AI tools to personalize learning, boost engagement, and optimize teaching. Revolutionize education with AI-powered solutions for students and educators worldwide.',
  openGraph: {
    title: 'NeuroLearn AI - Revolutionizing Education with AI',
    description: 'NeuroLearn AI provides cutting-edge AI tools to personalize learning, boost engagement, and optimize teaching. Revolutionize education with AI-powered solutions for students and educators worldwide.',
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
    title: 'NeuroLearn AI - Revolutionizing Education with AI',
    description: 'NeuroLearn AI provides cutting-edge AI tools to personalize learning, boost engagement, and optimize teaching. Revolutionize education with AI-powered solutions for students and educators worldwide.',
    creator: '@NeuroLearnAI',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code' // Placeholder: Replace with actual Google Search Console verification code
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
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
