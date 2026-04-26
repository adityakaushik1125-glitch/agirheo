import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import '@/styles/globals.css';

export const metadata: Metadata = {
  // ── Primary ──────────────────────────────────────────────────────────────
  title: {
    default: 'Agirheo — Execute. Dominate. Win.',
    template: '%s | Agirheo',
  },
  description:
    'Agirheo is the AI-powered execution system that holds you accountable to the person you claim to want to become. Clarity Engine, Mission System, Streak Tracker & more. Start your mission today.',
  keywords: [
    'Agirheo',
    'agirheo.com',
    'productivity system',
    'accountability app',
    'execution system',
    'AI productivity',
    'goal tracker',
    'habit tracker',
    'streak tracker',
    'mission system',
    'clarity engine',
    'self improvement app',
  ],
  authors: [{ name: 'Agirheo', url: 'https://agirheo.com' }],
  creator: 'Agirheo',
  publisher: 'Agirheo',
  metadataBase: new URL('https://agirheo.com'),
  alternates: { canonical: '/' },

  // ── Open Graph (Facebook, LinkedIn, WhatsApp) ─────────────────────────
  openGraph: {
    type: 'website',
    url: 'https://agirheo.com',
    title: 'Agirheo — You Were Built to Win',
    description:
      'Agirheo is not a productivity app. It is a system that understands you, prepares you, and holds you accountable. 6 core systems. One mission.',
    siteName: 'Agirheo',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Agirheo — Execute. Dominate. Win.',
      },
    ],
  },

  // ── Twitter / X ───────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Agirheo — Execute. Dominate. Win.',
    description:
      'The AI-powered system that holds you accountable to the best version of yourself. Stop planning. Start executing.',
    images: ['/og-image.jpg'],
    site: '@agirheo',
    creator: '@agirheo',
  },

  // ── Icons ─────────────────────────────────────────────────────────────
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  // ── Robots ────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Verification ──────────────────────────────────────────────────────
  // Replace with your actual Google Search Console verification code
  verification: {
    google: 'REPLACE_WITH_YOUR_GOOGLE_VERIFICATION_CODE',
  },
};

// ── Structured Data (JSON-LD) ──────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Agirheo',
      alternateName: 'Agirheo App',
      url: 'https://agirheo.com',
      description:
        'Agirheo is an AI-powered execution and accountability system. Define goals with surgical precision, execute daily missions, track streaks, and receive AI feedback comparing your reality vs your potential.',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Clarity Engine',
        'Mission System',
        'Streak Tracker',
        'AI Feedback System',
        'Environment Control',
        'Leverage Panel',
      ],
      screenshot: 'https://agirheo.com/og-image.jpg',
      creator: { '@type': 'Organization', name: 'Agirheo', url: 'https://agirheo.com' },
    },
    {
      '@type': 'Organization',
      name: 'Agirheo',
      url: 'https://agirheo.com',
      logo: 'https://agirheo.com/logo.png',
      sameAs: [
        'https://twitter.com/agirheo',
        'https://instagram.com/agirheo',
        'https://linkedin.com/company/agirheo',
      ],
    },
    {
      '@type': 'WebSite',
      name: 'Agirheo',
      url: 'https://agirheo.com',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="noise">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111118',
              border: '1px solid rgba(255,107,0,0.3)',
              color: '#e8e8f0',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: {
              iconTheme: { primary: '#00ff88', secondary: '#050507' },
            },
            error: {
              iconTheme: { primary: '#ff4444', secondary: '#050507' },
            },
          }}
        />
      </body>
    </html>
  );
}
