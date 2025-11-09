'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Msg = { role: 'user' | 'assistant'; content: string };
type Bot = { id: string; name: string };

export default function ChatPage() {
  const search = useSearchParams();
  const createdId = search.get('created'); // from the create page redirect
  const defaultBot = process.env.NEXT_PUBLIC_CHATBOT_ID || null;

  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<string | null>(defaultBot);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/chatbots')
      .then(r => r.json())
      .then((data: Bot[]) => setBots(data || []))
      .catch(() => setBots([]));
  }, []);

  // If redirected with ?created=..., preselect it once bots load
  useEffect(() => {
    if (createdId && bots.some(b => b.id === createdId)) {
      setSelectedBot(createdId);
    }
  }, [createdId, bots]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || !selectedBot || loading) return;

    setError(null);
    setLoading(true);

    const next = [...messages, { role: 'user', content: text } as Msg];
    setMessages(next);
    setInput('');

    try {
      const res = await fetch(`/api/chatbots/${selectedBot}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const data = (await res.json()) as { reply: string };
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setMessages((m) => m.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight">Chat</h1>
            <select
              className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
              value={selectedBot || ''}
              onChange={(e) => setSelectedBot(e.target.value || null)}
            >
              <option value="" disabled>
                {bots.length ? 'Select assistant' : 'No assistants yet'}
              </option>
              {bots.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="assistant/create-chatbot"
              className="rounded border border-neutral-700 px-3 py-1.5 text-xs"
            >
              Create assistant
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-4xl px-4 pb-28 pt-6">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 shadow-lg">
          {/* Message list */}
          <div className="h-[62vh] overflow-y-auto p-4 md:p-6">
            {messages.length === 0 && !loading && (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-neutral-500">
                  {selectedBot ? 'Say hi to get started' : 'Select or create an assistant to begin'}
                </p>
              </div>
            )}

            <ul className="space-y-3">
              {messages.map((m, i) => (
                <li key={i} className="flex">
                  <div
                    className={[
                      'max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed',
                      m.role === 'user'
                        ? 'ml-auto bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-600/30'
                        : 'mr-auto bg-neutral-800 text-neutral-100 ring-1 ring-neutral-700/60',
                    ].join(' ')}
                  >
                    {m.content}
                  </div>
                </li>
              ))}
              {loading && (
                <li className="flex">
                  <div className="mr-auto rounded-2xl bg-neutral-800 px-4 py-2 text-sm text-neutral-300 ring-1 ring-neutral-700/60">
                    Thinking…
                  </div>
                </li>
              )}
              <div ref={scrollRef} />
            </ul>
          </div>

          {/* Error / env warning */}
          <div className="px-4 pb-2 md:px-6">
            {!selectedBot && (
              <p className="text-xs text-red-400">
                No assistant selected. Create one or pick from the dropdown.
              </p>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          {/* Composer */}
          <div className="flex items-center gap-2 border-t border-neutral-800 p-3 md:p-4">
            <input
              className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm outline-none placeholder:text-neutral-500 focus:border-emerald-600"
              placeholder={selectedBot ? 'Type a message' : 'Create/select an assistant first'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={!selectedBot || loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim() || !selectedBot}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm enabled:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
