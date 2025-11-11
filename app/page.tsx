'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="relative min-h-[calc(100vh-56px)] bg-neutral-950 text-neutral-100">
      {/* subtle radial backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pt-16 sm:pt-20">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center">Assistants</h2>
        <p className="mt-2 max-w-[42ch] text-center text-sm text-neutral-400">
          Create, manage, and analyze your AI assistants — all in one place.
        </p>

        <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
          <Link
            href="/assistant/create-chatbot"
            className="rounded-xl bg-emerald-600 px-6 py-4 text-center text-sm font-medium text-white shadow-sm transition
                       hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Create Assistant
          </Link>

          <Link
            href="/assistant/manage"
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-4 text-center text-sm font-medium
                       text-neutral-100 transition hover:border-emerald-600 hover:text-emerald-400
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Manage Assistants
          </Link>

          <Link
            href="/analytics"
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-4 text-center text-sm font-medium
                       text-neutral-100 transition hover:border-emerald-600 hover:text-emerald-400
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </main>
  );
}
