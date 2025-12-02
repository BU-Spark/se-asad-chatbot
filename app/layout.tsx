import type { Metadata } from 'next';
import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import { Outfit } from 'next/font/google';

import Header from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Chat Suite - AI Assistant Management',
  description:
    'Create, manage, and analyze your AI assistants with Chat Suite. Group and embed your assistants with ease.',
  keywords: ['AI', 'Chat', 'Assistants', 'OpenAI', 'LLM', 'Analytics'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${outfit.variable} min-h-dvh bg-neutral-950 text-neutral-100 antialiased`}
          suppressHydrationWarning
        >
          <ErrorBoundary>
            <Header />
            {children}
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
