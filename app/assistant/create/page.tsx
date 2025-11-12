'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateAssistantSimple() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch('/api/chatbots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, personality }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      // redirect to landing with the new id in query so we can preselect it
      router.push(`/?created=${data.id}`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Create new assistant</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full rounded border border-neutral-700 bg-neutral-900 p-3 text-sm"
          placeholder="Name (e.g., Coding Bot)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          className="h-40 w-full rounded border border-neutral-700 bg-neutral-900 p-3 text-sm"
          placeholder="Personality prompt (system message)"
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          required
        />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border border-neutral-700 px-4 py-2 text-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </main>
  );
}
