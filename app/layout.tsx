import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "./components/ui/theme";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://neurolearn-ai.onrender.com"),
  title: {
    default: "NeuroLearn AI - AI-Powered Learning Platform",
    template: "%s | NeuroLearn AI",
  },
  description:
    "Unlock your potential with NeuroLearn AI — an innovative platform leveraging artificial intelligence to personalize your learning journey. Master new skills efficiently.",
  openGraph: {
    title: "NeuroLearn AI - AI-Powered Learning Platform",
    description:
      "Unlock your potential with NeuroLearn AI — an innovative platform leveraging artificial intelligence to personalize your learning journey.",
    url: "https://neurolearn-ai.onrender.com",
    siteName: "NeuroLearn AI",
    images: [
      {
        url: "/og-image.jpg", // Add this image to your /public folder
        width: 1200,
        height: 630,
        alt: "NeuroLearn AI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroLearn AI - AI-Powered Learning Platform",
    description:
      "Unlock your potential with NeuroLearn AI — personalized AI-powered learning.",
    images: ["/og-image.jpg"], // Reuses same image, add /twitter-image.jpg if you have a separate one
  },
  alternates: {
    canonical: "https://neurolearn-ai.onrender.com",
  },
  // Uncomment and add your real code once you verify in Google Search Console:
  // verification: {
  //   google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NeuroLearn AI",
              url: "https://neurolearn-ai.onrender.com",
              logo: "https://neurolearn-ai.onrender.com/logo.png", // Add logo.png to /public
              // Uncomment and update if you want contact info public:
              // contactPoint: {
              //   "@type": "ContactPoint",
              //   telephone: "+256775260196",
              //   contactType: "Customer Service",
              // },
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
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-right" />
        <div id="modal-root"></div>
      </body>
    </html>
  );
}