import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NeuroLearn AI - Personalized Learning Powered by AI',
  description: 'Unlock your full potential with AI-driven personalized learning. NeuroLearn AI adapts to your unique learning style and pace, making complex topics easy to understand and master.',
  openGraph: {
    title: 'NeuroLearn AI - Personalized Learning Powered by AI',
    description: 'Unlock your full potential with AI-driven personalized learning. NeuroLearn AI adapts to your unique learning style and pace, making complex topics easy to understand and master.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Ensure this image exists in your public folder (e.g., public/og-image.jpg)
        width: 1200,
        height: 630,
        alt: 'NeuroLearn AI Logo and Slogan',
        type: 'image/jpeg', // Adjust type if using PNG or other format
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuroLearn AI - Personalized Learning Powered by AI',
    description: 'Unlock your full potential with AI-driven personalized learning. NeuroLearn AI adapts to your unique learning style and pace, making complex topics easy to understand and master.',
    creator: '@NeuroLearnAI', // Replace with your actual Twitter handle if available
    site: '@NeuroLearnAI',   // Replace with your actual Twitter handle if available
    images: ['https://neurolearn-ai.onrender.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  },
  // Add Google Search Console verification if you have the code
  // verification: {
  //   google: 'your-google-site-verification-code',
  // },
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
