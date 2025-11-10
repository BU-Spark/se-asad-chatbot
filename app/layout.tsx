// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import { Outfit } from 'next/font/google';

import Header from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';
import '@/lib/server-init';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Assistants Embedder',
  description: 'Group and embed your OpenAI assistants on your website',
  keywords: ['Next.js', 'React', 'TypeScript', 'Template'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      {/* Extensions like Grammarly add attributes; suppress the mismatch */}
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${outfit.variable} min-h-dvh bg-background text-foreground antialiased`}
          suppressHydrationWarning
        >
          <ErrorBoundary>
            <Header />
            <main className="main-content-container">{children}</main>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
