import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroLearn AI - Personalized Learning with AI',
  description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, adaptive content, and AI-powered insights for students and professionals.',
  openGraph: {
    title: 'NeuroLearn AI - Personalized Learning with AI',
    description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, adaptive content, and AI-powered insights for students and professionals.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Ensure this image exists in your public folder
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
    title: 'NeuroLearn AI - Personalized Learning with AI',
    description: 'Unlock your potential with NeuroLearn AI. Personalized learning paths, adaptive content, and AI-powered insights for students and professionals.',
    creator: '@neurolearnai', // Replace with your actual Twitter handle if applicable
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Ensure this image exists in your public folder
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Replace with your actual Google Search Console verification code
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
      <body>{children}</body>
    </html>
  );
}
