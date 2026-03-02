import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://neurolearn-ai.onrender.com/'),
  title: {
    default: 'Neurolearn AI - AI-Powered Learning Platform',
    template: '%s | Neurolearn AI',
  },
  description: 'Unlock your potential with Neurolearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey. Master new skills efficiently.',
  openGraph: {
    title: 'Neurolearn AI - AI-Powered Learning Platform',
    description: 'Unlock your potential with Neurolearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey. Master new skills efficiently.',
    url: 'https://neurolearn-ai.onrender.com/',
    siteName: 'Neurolearn AI',
    images: [
      {
        url: '/og-image.jpg', // Placeholder: Ensure this image exists in your public directory
        width: 1200,
        height: 630,
        alt: 'Neurolearn AI Open Graph Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neurolearn AI - AI-Powered Learning Platform',
    description: 'Unlock your potential with Neurolearn AI, an innovative platform leveraging artificial intelligence to personalize your learning journey. Master new skills efficiently.',
    images: ['/twitter-image.jpg'], // Placeholder: Ensure this image exists in your public directory
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE', // Replace with your actual Google Search Console verification code
  },
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Schema Markup for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Neurolearn AI",
              "url": "https://neurolearn-ai.onrender.com/",
              "logo": "https://neurolearn-ai.onrender.com/logo.png", // Placeholder: Ensure this logo exists in your public directory
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+256775260196",
                "contactType": "Customer Service"
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Kampala",
                "addressRegion": "Uganda",
                "addressCountry": "UG"
              },
              "sameAs": [
                // Add social media profiles here if available, e.g.:
                // "https://facebook.com/neurolearnai",
                // "https://twitter.com/neurolearnai",
                // "https://linkedin.com/company/neurolearnai"
              ]
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
