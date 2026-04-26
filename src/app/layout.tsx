import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Agirheo — Execute. Dominate. Win.',
  description: 'The platform that transforms you from who you are to who you are meant to be.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
