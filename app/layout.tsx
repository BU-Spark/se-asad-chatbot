import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ClerkProvider } from '@clerk/nextjs';
import Header from './components/Header';

export const metadata: Metadata = {
  title: 'Assistants Embedder',
  description: 'Group and embed your OpenAI assistants on your website',
  keywords: ['Next.js', 'React', 'TypeScript', 'Template'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {/* Extensions like Grammarly add attributes; suppress the mismatch */}
      <html lang="en" className="dark" suppressHydrationWarning>
        <body suppressHydrationWarning>
          <ErrorBoundary>
            <Header />
            <div className="main-content-container">{children}</div>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
