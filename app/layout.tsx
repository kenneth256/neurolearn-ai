import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NeuroLearn AI - AI-Powered Learning Platform',
  description: 'Unlock your potential with NeuroLearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey.',
  openGraph: {
    title: 'NeuroLearn AI - AI-Powered Learning Platform',
    description: 'Unlock your potential with NeuroLearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Placeholder image
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
    title: 'NeuroLearn AI - AI-Powered Learning Platform',
    description: 'Unlock your potential with NeuroLearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey.',
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Placeholder image
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Replace with actual Google Search Console verification code
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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NeuroLearn AI",
    "url": "https://neurolearn-ai.onrender.com",
    "logo": "https://neurolearn-ai.onrender.com/logo.png", // Replace with actual logo URL
    "sameAs": [
      "https://neurolearn-ai.onrender.com" // Using the provided organization URL as 'sameAs'
    ]
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
