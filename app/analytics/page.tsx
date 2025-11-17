'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AnalyticsOverview {
  totalTokens: number;
  chatbotCount: number;
  groupCount: number;
}

interface ChatbotUsage {
  id: string;
  name: string;
  totalTokens: number;
  conversationCount: number;
  lastUsed: string | null;
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [chatbots, setChatbots] = useState<ChatbotUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);

        // Fetch overview data
        const overviewRes = await fetch('/api/analytics/overview');
        if (!overviewRes.ok) throw new Error('Failed to fetch overview');
        const overviewData = await overviewRes.json();
        setOverview(overviewData);

        // Fetch chatbot usage data
        const chatbotsRes = await fetch('/api/analytics/chatbots');
        if (!chatbotsRes.ok) throw new Error('Failed to fetch chatbots');
        const chatbotsData = await chatbotsRes.json();
        setChatbots(chatbotsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <main className="relative min-h-[calc(100vh-56px)] bg-neutral-950 text-neutral-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-16">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative min-h-[calc(100vh-56px)] bg-neutral-950 text-neutral-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pt-16">
          <div className="rounded-xl border border-red-800 bg-red-950/50 p-6 text-center">
            <p className="text-red-300">Error loading analytics: {error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-56px)] bg-neutral-950 text-neutral-100">
      {/* Subtle radial backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Analytics</h1>
            <p className="mt-2 text-sm text-neutral-400">Track your assistant usage and performance metrics</p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium
                       text-neutral-100 transition hover:border-emerald-600 hover:text-emerald-400"
          >
            ← Back
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {/* Total Tokens Card */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Tokens</p>
                <p className="mt-2 text-3xl font-bold text-emerald-400">
                  {overview ? formatNumber(overview.totalTokens) : '0'}
                </p>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-3">
                <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Chatbots Card */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Assistants</p>
                <p className="mt-2 text-3xl font-bold text-blue-400">{overview ? overview.chatbotCount : '0'}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Groups Card */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Groups</p>
                <p className="mt-2 text-3xl font-bold text-purple-400">{overview ? overview.groupCount : '0'}</p>
              </div>
              <div className="rounded-full bg-purple-500/10 p-3">
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Chatbot Usage List */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
          <div className="border-b border-neutral-800 p-6">
            <h2 className="text-xl font-semibold">Assistant Usage</h2>
            <p className="mt-1 text-sm text-neutral-400">Ranked by total tokens consumed</p>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {chatbots.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-neutral-800 p-4">
                  <svg className="h-full w-full text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-neutral-400">No usage data yet</p>
                <p className="mt-1 text-sm text-neutral-500">Start using your assistants to see analytics</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {chatbots.map((chatbot, index) => (
                  <div key={chatbot.id} className="p-6 transition hover:bg-neutral-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Rank Badge */}
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                            index === 0
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : index === 1
                                ? 'bg-neutral-400/20 text-neutral-300'
                                : index === 2
                                  ? 'bg-orange-500/20 text-orange-400'
                                  : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {index + 1}
                        </div>

                        {/* Chatbot Info */}
                        <div>
                          <h3 className="font-medium text-neutral-100">{chatbot.name}</h3>
                          <div className="mt-1 flex items-center gap-4 text-sm text-neutral-400">
                            <span className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                              </svg>
                              {chatbot.conversationCount} conversations
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {formatDate(chatbot.lastUsed)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Token Count */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-400">{formatNumber(chatbot.totalTokens)}</p>
                        <p className="text-sm text-neutral-500">tokens</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
