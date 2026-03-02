import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeuroLearn AI - Empowering Learning with Artificial Intelligence",
  description: "NeuroLearn AI provides cutting-edge AI solutions for personalized learning and educational advancement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "NeuroLearn AI",
        "url": "https://neurolearn-ai.onrender.com",
        "logo": "https://neurolearn-ai.onrender.com/logo.png", // IMPORTANT: Replace with the actual URL to your organization's logo
        "sameAs": [
          // Add URLs to your organization's social media profiles here (e.g., Twitter, LinkedIn, Facebook)
          // "https://twitter.com/yourcompany",
          // "https://linkedin.com/company/yourcompany"
        ]
      },
      {
        "@type": "WebSite",
        "name": "NeuroLearn AI",
        "url": "https://neurolearn-ai.onrender.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://neurolearn-ai.onrender.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en">
      {/* JSON-LD Schema Markup for Organization and WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
