import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeuronLearn-ai | AI-Powered Education & Learning Solutions',
  description: 'NeuronLearn-ai: AI-powered education. Discover our profiles on Google My Business and Wikipedia.',
  openGraph: {
    title: 'NeuronLearn-ai | AI-Powered Education & Learning Solutions',
    description: 'NeuronLearn-ai: AI-powered education. Discover our profiles on Google My Business and Wikipedia.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuronLearn-ai',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Placeholder: Replace with actual Open Graph image URL
        width: 1200,
        height: 630,
        alt: 'NeuronLearn-ai - AI-Powered Education',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuronLearn-ai | AI-Powered Education & Learning Solutions',
    description: 'NeuronLearn-ai: AI-powered education. Discover our profiles on Google My Business and Wikipedia.',
    creator: '@NeuronLearnAI', // Placeholder: Replace with actual Twitter handle
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Placeholder: Replace with actual Twitter Card image URL
  },
  verification: {
    google: 'your-google-site-verification-code', // Placeholder: Replace with actual Google Search Console verification code
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
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
