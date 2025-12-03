'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Copy, Check, Code } from 'lucide-react';

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
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const getAssistantsByGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return [];
    return assistants.filter((a) => group.assistant_ids.includes(a.id));
  };

  const getEmbedCode = (groupId: string) => {
    return `<script 
  src="http://localhost:3000/embed/embed.js" 
  data-chatbot-group-id="${groupId}">
</script>`;
  };

  const copyEmbedCode = async (groupId: string) => {
    try {
      await navigator.clipboard.writeText(getEmbedCode(groupId));
      setCopiedId(groupId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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

  const toggleGroup = (groupId: string) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  const toggleCode = (groupId: string) => {
    setExpandedCodeId(expandedCodeId === groupId ? null : groupId);
  };

  return (
    <main className="relative min-h-[calc(100vh-56px)] bg-neutral-950 text-neutral-100">
      {/* Subtle radial backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Manage Assistants</h1>
            <p className="mt-2 text-sm text-neutral-400">Organize your assistants into groups and get embed codes</p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium
                       text-neutral-100 transition hover:border-emerald-600 hover:text-emerald-400"
          >
            ← Back
          </Link>
        </div>

        {/* Create Group Toolbar */}
        <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="New group name"
              className="flex-1 min-w-[200px] rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Groups - LEFT SIDE (Main Focus) */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Groups</h2>
              <p className="text-sm text-neutral-400 mt-1">
                Click on a group to view assistants and get the embed code
              </p>
            </div>

            {loading ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center backdrop-blur-sm">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                <p className="mt-4 text-sm text-neutral-400">Loading groups…</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center backdrop-blur-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800">
                  <svg className="h-8 w-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-neutral-400">No groups yet</p>
                <p className="mt-1 text-sm text-neutral-500">Create your first group to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((group) => {
                  const isExpanded = expandedGroupId === group.id;
                  const isCodeExpanded = expandedCodeId === group.id;
                  const isCopied = copiedId === group.id;
                  const groupAssistants = getAssistantsByGroup(group.id);

                  return (
                    <div
                      key={group.id}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm overflow-hidden"
                    >
                      {/* Group Header - Clickable */}
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="w-full p-6 text-left transition hover:bg-neutral-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold">{group.name}</h3>
                              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                                {group.assistant_ids.length}{' '}
                                {group.assistant_ids.length === 1 ? 'assistant' : 'assistants'}
                              </span>
                            </div>
                            {group.created_at && (
                              <p className="mt-1 text-xs text-neutral-500">
                                Created {new Date(group.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-neutral-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-neutral-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-neutral-800 p-6 space-y-6">
                          {/* Assistants in Group */}
                          <div>
                            <h4 className="text-sm font-medium text-neutral-300 mb-3">Assistants in this group</h4>
                            {groupAssistants.length === 0 ? (
                              <p className="text-sm text-neutral-500">No assistants in this group yet</p>
                            ) : (
                              <ul className="space-y-2">
                                {groupAssistants.map((assistant) => (
                                  <li key={assistant.id} className="rounded-lg bg-neutral-800/50 p-3 text-sm">
                                    <div className="font-medium">{assistant.name}</div>
                                    {assistant.model && (
                                      <div className="mt-1 text-xs text-neutral-500">{assistant.model}</div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* Embed Code Section */}
                          <div className="rounded-lg border border-neutral-700 bg-neutral-900">
                            <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                              <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-emerald-400" />
                                <h4 className="text-sm font-medium">Embed Code</h4>
                              </div>
                              <button
                                onClick={() => toggleCode(group.id)}
                                className="text-xs text-neutral-400 hover:text-neutral-200 transition"
                              >
                                {isCodeExpanded ? 'Collapse' : 'Expand'}
                              </button>
                            </div>

                            <div className="p-4 space-y-3">
                              <p className="text-xs text-neutral-400">
                                Copy this code and paste it before the closing{' '}
                                <code className="text-emerald-400">&lt;/body&gt;</code> tag in your HTML file
                              </p>

                              {isCodeExpanded && (
                                <pre className="rounded-lg bg-neutral-950 p-4 text-xs overflow-x-auto border border-neutral-800">
                                  <code className="text-neutral-300">{getEmbedCode(group.id)}</code>
                                </pre>
                              )}

                              <div className="relative">
                                <button
                                  onClick={() => copyEmbedCode(group.id)}
                                  className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 flex items-center justify-center gap-2"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="h-4 w-4" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-4 w-4" />
                                      Copy Embed Code
                                    </>
                                  )}
                                </button>

                                {/* Tooltip */}
                                {isCopied && (
                                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-3 py-1 rounded-lg shadow-lg">
                                    Copied to clipboard!
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assistants - RIGHT SIDE */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">All Assistants</h2>
              <p className="text-sm text-neutral-400 mt-1">{selectedIds.length} selected</p>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search assistants..."
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Assistant List */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-neutral-400">No assistants found</p>
                  <Link
                    href="/assistant/create-chatbot"
                    className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
                  >
                    Create Assistant
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-800 max-h-[600px] overflow-y-auto">
                  {filtered.map((a) => {
                    const isSel = !!selected[a.id];
                    return (
                      <li key={a.id} className="p-3 transition hover:bg-neutral-800/50">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={(e) => setSelected((prev) => ({ ...prev, [a.id]: e.target.checked }))}
                            className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{a.name}</div>
                            {a.model && <div className="mt-1 text-xs text-neutral-500">{a.model}</div>}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Add to Group Actions */}
            {selectedIds.length > 0 && groups.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-neutral-400">Add selected to group:</p>
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => addToGroup(g.id)}
                    className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:bg-neutral-700 text-left"
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
