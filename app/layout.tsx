import React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Best AI Tutor | Neurolearn AI — Learn Anything From a Single Prompt',
  description: 'Unlock your potential with Neurolearn AI. The best AI-powered tutor to learn anything, boost productivity, and personalize your educational journey for free.',
  alternates: {
    canonical: 'https://neurolearn-ai.onrender.com',
  },
  openGraph: {
    title: 'Best AI Tutor | Neurolearn AI — Learn Anything From a Single Prompt',
    description: 'Unlock your potential with Neurolearn AI. The best AI-powered tutor to learn anything, boost productivity, and personalize your educational journey for free.',
    url: 'https://neurolearn-ai.onrender.com',
    siteName: 'Neurolearn AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://neurolearn-ai.onrender.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Neurolearn AI — Best AI Tutor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@neurolearnai',
    title: 'Best AI Tutor | Neurolearn AI — Learn Anything From a Single Prompt',
    description: 'Unlock your potential with Neurolearn AI. The best AI-powered tutor to learn anything, boost productivity, and personalize your educational journey for free.',
    images: ['https://neurolearn-ai.onrender.com/og-image.png'],
  },
};

import { ThemeProvider, ThemeScript } from '@/app/components/ui/theme';

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Neurolearn AI',
    description: 'The best AI-powered tutor to learn anything from a single prompt.',
    url: 'https://neurolearn-ai.onrender.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://neurolearn-ai.onrender.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Neurolearn AI',
    url: 'https://neurolearn-ai.onrender.com',
    logo: 'https://neurolearn-ai.onrender.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@neurolearn-ai.com',
    },
    sameAs: [
      'https://twitter.com/neurolearnai',
      'https://github.com/neurolearnai',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 main street',
      addressLocality: 'California',
      addressRegion: 'CA',
      addressCountry: 'US',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Neurolearn AI',
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Web',
    url: 'https://neurolearn-ai.onrender.com',
    description: 'An AI-powered tutoring platform that helps students and professionals learn any subject from a single prompt using personalized AI lessons.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '120',
    },
    featureList: [
      'AI-generated lessons from a single prompt',
      'Personalized learning paths',
      'Interactive quizzes and assessments',
      'Video generation for topics',
      'Multi-subject support',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Neurolearn AI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Neurolearn AI is an AI-powered tutoring platform that generates personalized lessons, quizzes, and learning materials on any subject from a single prompt.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Neurolearn AI free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Neurolearn AI offers a free plan that lets you start learning immediately with AI-generated lessons and quizzes.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Neurolearn AI work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply type any topic or question into Neurolearn AI, and it instantly generates a structured lesson, interactive quiz, and learning path tailored to your level.',
        },
      },
      {
        '@type': 'Question',
        name: 'What subjects can I learn with Neurolearn AI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Neurolearn AI supports any subject — from mathematics, science, and programming to history, languages, and professional skills.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is Neurolearn AI different from other AI tutors?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Unlike generic AI chatbots, Neurolearn AI is purpose-built for education — it structures content as lessons, tracks your progress, and adapts to your learning style.',
        },
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to learn any topic with Neurolearn AI',
    description: 'Use Neurolearn AI to generate a personalized lesson on any subject in seconds.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter your topic',
        text: 'Type any subject, question, or concept into the Neurolearn AI prompt box.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Get your AI lesson',
        text: 'Neurolearn AI instantly generates a structured lesson with explanations, examples, and key takeaways.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Test your knowledge',
        text: 'Take an AI-generated quiz to reinforce what you learned and identify gaps.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Continue your learning path',
        text: 'Follow the personalized learning path Neurolearn AI builds based on your progress.',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Neurolearn AI',
    url: 'https://neurolearn-ai.onrender.com',
    description: 'An AI-powered educational platform offering personalized tutoring, lessons, and quizzes across all subjects.',
    logo: 'https://neurolearn-ai.onrender.com/logo.png',
    sameAs: [
      'https://twitter.com/neurolearnai',
      'https://github.com/neurolearnai',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'AI Learning Tools',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'AI-Generated Lessons',
            description: 'Instant personalized lessons on any subject generated by AI from a single prompt.',
            provider: {
              '@type': 'Organization',
              name: 'Neurolearn AI',
            },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Course',
            name: 'Interactive AI Quizzes',
            description: 'Adaptive quizzes generated by AI to test and reinforce your knowledge on any topic.',
            provider: {
              '@type': 'Organization',
              name: 'Neurolearn AI',
            },
          },
        },
      ],
    },
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body>
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N6QCVGRM"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N6QCVGRM');
          `}
        </Script>

        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}