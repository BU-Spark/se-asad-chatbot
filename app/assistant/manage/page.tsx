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
  deleted_at?: string | null;
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

        const aJson = await aRes.json(); // -> Assistant[]
        const gJson = await gRes.json(); // -> Group[]

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

  const activeGroups = useMemo(() => {
    return groups.filter((g) => !g.deleted_at);
  }, [groups]);

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
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Assistants</h1>
        {/* removed: Open Groups view */}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search assistants"
          className="w-72 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none"
        />
        <div className="flex items-center gap-2">
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
            className="w-56 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={createGroup}
            disabled={creatingGroup || !newGroupName.trim()}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20 disabled:opacity-50"
          >
            {creatingGroup ? 'Creating…' : 'Create group'}
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assistants list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">All assistants</h2>
            <div className="text-sm text-neutral-400">{selectedIds.length} selected</div>
          </div>

          <div className="rounded-2xl border border-neutral-800">
            {loading ? (
              <div className="p-8 text-sm text-neutral-400">Loading assistants…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-sm text-neutral-400">No assistants found.</div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-3">
                {filtered.map((a) => {
                  const isSel = !!selected[a.id];
                  return (
                    <li key={a.id} className="rounded-xl border border-neutral-700 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-neutral-400">{a.model || 'model: gpt-5'}</div>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={(e) => setSelected((prev) => ({ ...prev, [a.id]: e.target.checked }))}
                            className="h-4 w-4"
                          />
                          <span className="text-neutral-300">Select</span>
                        </label>
                      </div>
                      {a.personality && <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{a.personality}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Groups column */}
        <div>
          <h2 className="text-lg font-medium mb-3">Groups</h2>
          <div className="space-y-3">
            {activeGroups.length === 0 ? (
              <div className="rounded-2xl border border-neutral-800 p-6 text-sm text-neutral-400">
                No groups yet. Create one above.
              </div>
            ) : (
              activeGroups.map((g) => {
                const count = g.assistant_ids?.length ?? 0;

                const handleDelete = async () => {
                  const ok = confirm(`Delete group "${g.name}"?`);
                  if (!ok) return;

                  const res = await fetch(`/api/chatbot-groups/${g.id}`, { method: 'DELETE' });
                  if (!res.ok) {
                    const j = await res.json().catch(() => ({}));
                    alert(j.message || 'Failed to delete group');
                    return;
                  }
                  // optimistic remove
                  setGroups((prev) => prev.filter((x) => x.id !== g.id));
                };

                return (
                  <div key={g.id} className="rounded-2xl border border-neutral-800 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate">{g.name}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToGroup(g.id)}
                          disabled={selectedIds.length === 0}
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20 disabled:opacity-50"
                        >
                          {selectedIds.length > 0 ? `Add ${selectedIds.length} selected` : 'Add selected'}
                        </button>
                        <button
                          onClick={handleDelete}
                          className="rounded-lg bg-red-500/20 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/30"
                          aria-label={`Delete ${g.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-neutral-400">
                      {count} {count === 1 ? 'assistant' : 'assistants'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
