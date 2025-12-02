'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Assistant = {
  id: string;
  name: string;
  model?: string;
  personality?: string;
  created_at?: string;
};

type Group = {
  id: string;
  name: string;
  assistant_ids: string[];
  created_at?: string;
};

export default function ManageAssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [aRes, gRes] = await Promise.all([
          fetch('/api/chatbots', { cache: 'no-store' }),
          fetch('/api/chatbot-groups', { cache: 'no-store' }),
        ]);

        if (!aRes.ok) throw new Error('Failed to load assistants');
        if (!gRes.ok) throw new Error('Failed to load groups');

        const aJson = await aRes.json();
        const gJson = await gRes.json();

        if (!cancelled) {
          setAssistants(aJson || []);
          setGroups(gJson || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return assistants;
    return assistants.filter(
      (a) => a.name.toLowerCase().includes(term) || (a.model || '').toLowerCase().includes(term)
    );
  }, [assistants, q]);

  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k),
    [selected]
  );

  async function createGroup() {
    if (!newGroupName.trim()) return;
    try {
      setCreatingGroup(true);
      const res = await fetch('/api/chatbot-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create group');
      const g: Group = await res.json();
      setGroups((prev) => [g, ...prev]);
      setNewGroupName('');
    } catch (e) {
      console.error(e);
      alert('Could not create group');
    } finally {
      setCreatingGroup(false);
    }
  }

  async function addToGroup(groupId: string) {
    if (selectedIds.length === 0) {
      alert('Select at least one assistant');
      return;
    }
    try {
      const res = await fetch(`/api/chatbot-groups/${groupId}/bots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantIds: selectedIds }),
      });
      if (!res.ok) throw new Error('Failed to add to group');
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, assistant_ids: Array.from(new Set([...g.assistant_ids, ...selectedIds])) } : g
        )
      );
      setSelected({});
    } catch (e) {
      console.error(e);
      alert('Could not add assistants to group');
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-56px)] bg-neutral-950 text-neutral-100">
      {/* Subtle radial backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Manage Assistants</h1>
            <p className="mt-2 text-sm text-neutral-400">Organize your assistants and create groups</p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium
                       text-neutral-100 transition hover:border-emerald-600 hover:text-emerald-400"
          >
            ← Back
          </Link>
        </div>

        {/* Toolbar */}
        <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search assistants..."
              className="flex-1 min-w-[200px] rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-2">
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="New group name"
                className="w-56 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={createGroup}
                disabled={creatingGroup || !newGroupName.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingGroup ? 'Creating…' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assistants list */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">All Assistants</h2>
              <div className="text-sm text-neutral-400">{selectedIds.length} selected</div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                  <p className="mt-4 text-sm text-neutral-400">Loading assistants…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800">
                    <svg className="h-8 w-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <p className="text-neutral-400">No assistants found</p>
                  <Link
                    href="/assistant/create-chatbot"
                    className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
                  >
                    Create Your First Assistant
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-800">
                  {filtered.map((a) => {
                    const isSel = !!selected[a.id];
                    return (
                      <li key={a.id} className="p-4 transition hover:bg-neutral-800/50">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={(e) => setSelected((prev) => ({ ...prev, [a.id]: e.target.checked }))}
                            className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{a.name}</div>
                            {a.model && <div className="mt-1 text-xs text-neutral-500">{a.model}</div>}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Groups sidebar */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Groups</h2>
            <div className="space-y-3">
              {groups.length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-center backdrop-blur-sm">
                  <p className="text-sm text-neutral-400">No groups yet</p>
                </div>
              ) : (
                groups.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 backdrop-blur-sm"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-medium">{g.name}</div>
                      <div className="text-xs text-neutral-500">{g.assistant_ids.length} assistants</div>
                    </div>
                    <button
                      onClick={() => addToGroup(g.id)}
                      disabled={selectedIds.length === 0}
                      className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Selected
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
