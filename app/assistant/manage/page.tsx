// app/assistant/manage/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

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

  // Fetch data
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

        const aJson = await aRes.json(); // Assistant[]
        const gJson = await gRes.json(); // Group[]

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
      (a) =>
        a.name.toLowerCase().includes(term) ||
        (a.model || '').toLowerCase().includes(term)
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

      // optimistic update
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
              ...g,
              assistant_ids: Array.from(
                new Set([...g.assistant_ids, ...selectedIds])
              ),
            }
            : g
        )
      );
      setSelected({});
    } catch (e) {
      console.error(e);
      alert('Could not add assistants to group');
    }
  }

  return (
    <div
      className="
        min-h-screen w-full
        bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(251,113,133,0.12),transparent_55%),#020617]
      "
    >
      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        {/* Header */}
        <header className="mb-6 border-b border-neutral-800 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-neutral-50">
                Manage assistants
              </h1>
              <p className="mt-2 max-w-xl text-sm text-neutral-400">
                Search assistants, select them, and drop them into groups for
                different workflows.
              </p>
            </div>
            <div className="hidden text-xs text-neutral-500 md:block">
              <span className="rounded-full bg-neutral-900/80 px-3 py-1">
                {assistants.length} total assistants
              </span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                Search assistants
              </label>
              <div className="mt-1 flex items-center rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name or model"
                  className="w-full bg-transparent outline-none placeholder:text-neutral-500"
                />
              </div>
            </div>

            <div className="w-full md:w-72">
              <label className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                New group
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name"
                  className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
                />
                <button
                  onClick={createGroup}
                  disabled={creatingGroup || !newGroupName.trim()}
                  className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:opacity-50"
                >
                  {creatingGroup ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Body layout */}
        <section className="flex flex-col gap-6 md:flex-row">
          {/* Assistants list */}
          <div className="flex-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                All assistants
              </h2>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-sky-800 bg-sky-950/40 px-3 py-1.5 text-xs">
                  <span className="text-sky-100">
                    {selectedIds.length} assistant
                    {selectedIds.length === 1 ? '' : 's'} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelected({})}
                    className="text-neutral-300 hover:text-neutral-50"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60">
              {loading ? (
                <div className="p-8 text-sm text-neutral-400">
                  Loading assistants…
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-sm text-neutral-400">
                  No assistants match that search.
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((a) => {
                    const isSel = !!selected[a.id];
                    return (
                      <li
                        key={a.id}
                        onClick={() =>
                          setSelected((prev) => ({
                            ...prev,
                            [a.id]: !prev[a.id],
                          }))
                        }
                        className={[
                          'group flex cursor-pointer flex-col rounded-xl border px-4 py-3 text-sm transition',
                          'bg-neutral-900/80 backdrop-blur',
                          'hover:border-sky-500/70 hover:bg-neutral-900',
                          isSel
                            ? 'border-sky-500 shadow-[0_0_0_1px_rgba(56,189,248,0.7),0_18px_45px_rgba(15,23,42,0.9)]'
                            : 'border-neutral-800 shadow-[0_18px_45px_rgba(15,23,42,0.8)]',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-neutral-50">
                              {a.name}
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
                              {a.personality || 'No description yet'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="inline-flex items-center rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300">
                              {a.model || 'gpt-5'}
                            </span>
                            {isSel && (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[11px] text-sky-300">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Groups column */}
          <aside className="w-full max-w-xs space-y-3 md:w-80">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Groups
              </h2>
              <span className="text-[11px] text-neutral-500">
                {groups.length} total
              </span>
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {groups.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/70 px-4 py-6 text-sm text-neutral-400">
                  No groups yet. Create one to start organizing assistants.
                </div>
              ) : (
                groups.map((g) => {
                  const count = g.assistant_ids?.length ?? 0;

                  const handleDelete = async () => {
                    const ok = confirm(`Delete group "${g.name}"?`);
                    if (!ok) return;

                    const res = await fetch(`/api/chatbot-groups/${g.id}`, {
                      method: 'DELETE',
                    });
                    if (!res.ok) {
                      const j = await res.json().catch(() => ({} as any));
                      alert(j.message || 'Failed to delete group');
                      return;
                    }
                    setGroups((prev) => prev.filter((x) => x.id !== g.id));
                  };

                  return (
                    <div
                      key={g.id}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-sm shadow-[0_12px_32px_rgba(15,23,42,0.85)] transition hover:border-neutral-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="truncate text-sm font-medium text-neutral-50">
                            {g.name}
                          </div>
                          <div className="mt-1 text-[11px] text-neutral-400">
                            {count} {count === 1 ? 'assistant' : 'assistants'}
                          </div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300">
                          {count}
                        </span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => addToGroup(g.id)}
                          disabled={selectedIds.length === 0}
                          className="flex-1 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-50 transition hover:bg-neutral-700 disabled:opacity-50"
                        >
                          {selectedIds.length > 0
                            ? `Add ${selectedIds.length} selected`
                            : 'Add selected'}
                        </button>
                        <button
                          onClick={handleDelete}
                          className="rounded-lg bg-red-900/30 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-700/60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}  