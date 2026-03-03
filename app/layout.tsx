import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neurolearn AI: Personalized Learning with Advanced AI',
  description: 'Unlock your potential with Neurolearn AI. Our platform offers personalized education, adaptive learning paths, and AI-driven insights for students and professionals.',
  openGraph: {
    title: 'Neurolearn AI: Personalized Learning with Advanced AI',
    description: 'Unlock your potential with Neurolearn AI. Our platform offers personalized education, adaptive learning paths, and AI-driven insights for students and professionals.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'Neurolearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Placeholder, ensure this image exists in your public folder
        width: 1200,
        height: 630,
        alt: 'Neurolearn AI',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neurolearn AI: Personalized Learning with Advanced AI',
    description: 'Unlock your potential with Neurolearn AI. Our platform offers personalized education, adaptive learning paths, and AI-driven insights for students and professionals.',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Placeholder, ensure this image exists in your public folder
  },
  verification: {
    google: 'gdghfkkdkdnsn',
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
