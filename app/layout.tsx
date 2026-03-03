import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Neurolearn AI - Empowering Learning with Artificial Intelligence',
  description: 'Unlock your potential with Neurolearn AI. We provide cutting-edge AI-powered learning solutions for individuals and businesses.',
  openGraph: {
    title: 'Neurolearn AI - Empowering Learning with Artificial Intelligence',
    description: 'Unlock your potential with Neurolearn AI. We provide cutting-edge AI-powered learning solutions for individuals and businesses.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'Neurolearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Placeholder: Replace with actual Open Graph image URL
        width: 1200,
        height: 630,
        alt: 'Neurolearn AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neurolearn AI - Empowering Learning with Artificial Intelligence',
    description: 'Unlock your potential with Neurolearn AI. We provide cutting-edge AI-powered learning solutions for individuals and businesses.',
    creator: '@neurolearnai', // Placeholder: Replace with actual Twitter handle
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Placeholder: Replace with actual Twitter image URL
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Placeholder: Replace with your Google Search Console verification code
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  },
  // Adding JSON-LD schema markup for Organization, including 'sameAs' links to address local directories.
  // This helps search engines understand the entity and its presence across the web.
  scripts: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization", // Using Organization schema as it's an AI learning platform, not necessarily a physical local business.
        "name": "Neurolearn AI",
        "url": "https://neurolearn-ai.onrender.com",
        "logo": "https://neurolearn-ai.onrender.com/logo.png", // Placeholder: Replace with actual logo URL
        "sameAs": [
          "https://www.google.com/search?q=Neurolearn+AI", // Placeholder: Replace with actual Google My Business or Google Search profile URL
          "https://en.wikipedia.org/wiki/Neurolearn_AI" // Placeholder: Replace with actual Wikipedia Infobox URL if it exists
          // Add other relevant social media or directory links here once they are established,
          // e.g., "https://www.linkedin.com/company/neurolearn-ai",
          // e.g., "https://twitter.com/neurolearnai"
        ]
      }),
    },
  ],
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
