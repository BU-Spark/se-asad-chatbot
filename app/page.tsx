'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="relative min-h-[calc(100vh-56px)] bg-neutral-950 text-neutral-100">
      {/* Subtle radial backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl px-4 pt-16 pb-20 sm:pt-20">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Welcome to <span className="text-emerald-400">Chat Suite</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto">
            Your all-in-one platform for creating, managing, and analyzing AI assistants with ease
          </p>
        </div>

        {/* Get Started Section */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Get Started</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Create, manage, and analyze your AI assistants — all in one place
          </p>
        </div>

        {/* Clickable Feature Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Create Assistant Card */}
          <Link
            href="/assistant/create-chatbot"
            className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm transition hover:border-emerald-500 hover:bg-neutral-900 cursor-pointer"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 transition group-hover:bg-emerald-500/20">
              <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400 transition">Create Assistants</h3>
            <p className="text-sm text-neutral-400">
              Build custom AI assistants with powerful LLM integration and automatic analytics tracking
            </p>
          </Link>

          {/* Manage Assistants Card */}
          <Link
            href="/assistant/manage"
            className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm transition hover:border-blue-500 hover:bg-neutral-900 cursor-pointer"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 transition group-hover:bg-blue-500/20">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition">Manage & Organize</h3>
            <p className="text-sm text-neutral-400">
              Group your assistants, search efficiently, and organize your AI workforce in one place
            </p>
          </Link>

          {/* Analytics Card */}
          <Link
            href="/analytics"
            className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm transition hover:border-purple-500 hover:bg-neutral-900 cursor-pointer sm:col-span-2 lg:col-span-1"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 transition group-hover:bg-purple-500/20">
              <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition">Track Analytics</h3>
            <p className="text-sm text-neutral-400">
              Monitor token usage, costs, and performance metrics for all your assistants
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
