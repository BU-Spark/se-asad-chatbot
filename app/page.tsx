import Link from 'next/link';
import { Button } from '@/components/Button';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Assistants Embedder</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Group and Embed Your OpenAI Assistants
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Create groups of assistants and embed them on your website with a simple script tag.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/sign-up">
                  <Button size="large">Get Started</Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="large">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted-foreground/20 px-3 py-1 text-sm">Easy Integration</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Embed with a Single Line of Code</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Add your assistant groups to any website with a simple script tag. No complex setup required.
                </p>
              </div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted-foreground/20 px-3 py-1 text-sm">
                  Powerful Organization
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Group Assistants with Drag & Drop</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Easily organize your OpenAI assistants into logical groups using our intuitive drag and drop
                  interface.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <div className="container max-w-6xl mx-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Assistants Embedder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
