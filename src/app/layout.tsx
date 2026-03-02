import type { Metadata } from 'next';

export const metadata: Metadata = {
  // Existing metadata properties would go here, e.g., title, description, etc.
  // For example:
  // title: 'NeuroLearn AI',
  // description: 'AI-powered learning platform',
  
  // Adding a self-referencing hreflang for the single supported language 'en'.
  // This addresses the 'No hreflang tags detected' issue,
  // while respecting the 'isMultilingual: false' context by not implying other languages.
  // For a single-language site, a self-referencing hreflang tag is technically valid
  // but primarily serves to satisfy tools looking for its presence.
  alternates: {
    languages: {
      'en': 'https://neurolearn-ai.onrender.com',
    },
    // Optionally, if a canonical URL is not already set elsewhere, you might add it here.
    // canonical: 'https://neurolearn-ai.onrender.com',
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
