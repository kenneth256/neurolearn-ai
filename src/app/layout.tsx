import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeuroLearn AI',
  description: 'Empowering education with AI-driven learning solutions.',
  twitter: {
    card: 'summary_large_image',
    site: '@neuronlear-ai1',
    creator: '@neuronlear-ai1',
    title: 'NeuroLearn AI - AI-Powered Learning',
    description: 'Unlock your potential with personalized AI-driven education from NeuroLearn AI.',
    images: ['https://neurolearn-ai.onrender.com/og-image.jpg'], // IMPORTANT: Ensure this image exists in your public directory or update the URL to your desired social sharing image.
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
