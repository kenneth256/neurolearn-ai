import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeuroLearn-ai: Your gateway to personalized learning",
  description: "Revolutionize education with AI. NeuroLearn-ai offers personalized learning experiences, adaptive content, and AI-powered insights for students and educators.",
  openGraph: {
    title: "NeuroLearn-ai: Your gateway to personalized learning",
    description: "Revolutionize education with AI. NeuroLearn-ai offers personalized learning experiences, adaptive content, and AI-powered insights for students and educators.",
    url: "https://neurolearn-ai.onrender.com",
    siteName: "NeuroLearn-ai",
    images: [
      {
        url: "https://neurolearn-ai.onrender.com/og-image.jpg", // Replace with your actual OG image path
        width: 1200,
        height: 630,
        alt: "NeuroLearn-ai: AI-Powered Personalized Learning",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroLearn-ai: Your gateway to personalized learning",
    description: "Revolutionize education with AI. NeuroLearn-ai offers personalized learning experiences, adaptive content, and AI-powered insights for students and educators.",
    images: ["https://neurolearn-ai.onrender.com/twitter-image.jpg"], // Replace with your actual Twitter image path
    creator: "@NeuroLearnAI", // Replace with your Twitter handle
  },
  verification: {
    google: "your-google-site-verification-code", // Replace with your actual Google Search Console verification code
  },
  alternates: {
    canonical: "https://neurolearn-ai.onrender.com",
    languages: {
      'en-US': 'https://neurolearn-ai.onrender.com/en-US',
      // Add other language alternatives if applicable
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
