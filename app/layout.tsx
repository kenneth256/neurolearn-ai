import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'NeuronLearn-ai | AI-Powered Learning Solutions',
    template: '%s | NeuronLearn-ai',
  },
  description: 'NeuronLearn-ai specializes in cutting-edge AI software for enhanced learning and educational solutions. Discover our innovative platforms.',
  openGraph: {
    title: 'NeuronLearn-ai | AI-Powered Learning Solutions',
    description: 'NeuronLearn-ai specializes in cutting-edge AI software for enhanced learning and educational solutions. Discover our innovative platforms.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuronLearn-ai',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuronLearn-ai | AI-Powered Learning Solutions',
    description: 'NeuronLearn-ai specializes in cutting-edge AI software for enhanced learning and educational solutions. Discover our innovative platforms.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "NeuronLearn-ai",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 lane line",
      "addressLocality": "san Francisco",
      "addressRegion": "CA",
      "postalCode": "94107",
      "addressCountry": "USA"
    },
    "telephone": "+256775260196",
    "url": "https://neurolearn-ai.onrender.com",
    "description": "NeuronLearn-ai is a software company specializing in AI-powered learning solutions."
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {children}
      </body>
    </html>
  )
}
