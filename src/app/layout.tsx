import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NeuroLearn AI - Empowering Minds with AI-Driven Learning',
  description: 'NeuroLearn AI offers cutting-edge AI-driven learning solutions to enhance knowledge retention and accelerate skill development. Discover personalized educational experiences.',
  metadataBase: new URL('https://neurolearn-ai.onrender.com'), // Set your canonical domain
  openGraph: {
    title: 'NeuroLearn AI - Empowering Minds with AI-Driven Learning',
    description: 'NeuroLearn AI offers cutting-edge AI-driven learning solutions to enhance knowledge retention and accelerate skill development. Discover personalized educational experiences.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'NeuroLearn AI',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.jpg', // Replace with your actual Open Graph image path in public folder
        width: 1200,
        height: 630,
        alt: 'NeuroLearn AI - AI-driven learning platform',
      },
      // You can add more images here if needed
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuroLearn AI - Empowering Minds with AI-Driven Learning',
    description: 'NeuroLearn AI offers cutting-edge AI-driven learning solutions to enhance knowledge retention and accelerate skill development. Discover personalized educational experiences.',
    creator: '@neurolearnai', // Replace with your Twitter handle if available
    images: ['https://neurolearn-ai.onrender.com/twitter-image.jpg'], // Replace with your actual Twitter card image path in public folder
  },
  // Add other essential meta tags like viewport, robots, etc. if not already present
  // viewport: 'width=device-width, initial-scale=1',
  // robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
