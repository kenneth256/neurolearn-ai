import "./globals.css";
import type { Metadata } from "next";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { ThemeProvider, ThemeScript } from "./components/ui/theme";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "NeuroLearn AI - Revolutionizing AI-Powered Education",
  description:
    "Unlock your potential with NeuroLearn AI. Comprehensive courses, cutting-edge tools, and expert guidance in AI and machine learning.",
  openGraph: {
    title: "NeuroLearn AI - Revolutionizing AI-Powered Education",
    description:
      "Unlock your potential with NeuroLearn AI. Comprehensive courses, cutting-edge tools, and expert guidance in AI and machine learning.",
    url: "https://neurolearn-ai.onrender.com",
    siteName: "NeuroLearn AI",
    images: [{ url: "https://neurolearn-ai.onrender.com/og-image.jpg", width: 1200, height: 630, alt: "NeuroLearn AI" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroLearn AI - Revolutionizing AI-Powered Education",
    description:
      "Unlock your potential with NeuroLearn AI. Comprehensive courses, cutting-edge tools, and expert guidance in AI and machine learning.",
    creator: "@neurolearnai",
    images: ["https://neurolearn-ai.onrender.com/twitter-image.jpg"],
  },
  verification: {
    google: "lVxgtF-nQXKZjok-QcQBEGJb59PhuWhlTfYXb2eJbbA",
  },
  alternates: {
    canonical: "https://neurolearn-ai.onrender.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NeuroLearn AI",
              url: "https://neurolearn-ai.onrender.com",
              logo: "https://neurolearn-ai.onrender.com/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+256775260196",
                contactType: "Customer Service",
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Kampala",
                addressRegion: "Uganda",
                addressCountry: "UG",
              },
            }),
          }}
        />
      </head>
      <body>
        <GoogleTagManager gtmId="GTM-N6QCVGRM" />
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-right" />
        <div id="modal-root" />
      </body>
      <GoogleAnalytics gaId="G-NKCGPKJTF7" />
    </html>
  );
}