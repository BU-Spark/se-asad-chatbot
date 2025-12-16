'use client';

import { useEffect, useState } from 'react';

type Bot = { id: string; name: string };
type Group = { id: string; name: string; bot_ids: string[]; created_at: string };

export default function GroupsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    (async () => {
      const [b, g] = await Promise.all([
        fetch('/api/chatbots').then((r) => r.json()),
        fetch('/api/chatbot-groups').then((r) => r.json()),
      ]);
      setBots(b ?? []);
      setGroups(g ?? []);
    })();
  }, []);

  async function createGroup() {
    const res = await fetch('/api/chatbot-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || 'New group' }),
    });
    const grp = await res.json();
    if (res.ok) setGroups((prev) => [grp, ...prev]);
    setName('');
  }

  async function addToGroup(groupId: string, chatbotId: string) {
    const res = await fetch(`/api/chatbot-groups/${groupId}/bots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatbotId }),
    });
    const updated = await res.json();
    if (res.ok) setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Chatbot Groups</h1>

      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 w-64"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="rounded bg-black text-white px-4 py-2" onClick={createGroup}>
          Create
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <div key={g.id} className="border rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{g.name}</div>
              <div className="text-sm text-gray-500">{g.bot_ids.length} bots</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {bots.map((b) => {
                const inGroup = g.bot_ids.includes(b.id);
                return (
                  <button
                    key={b.id}
                    onClick={() => addToGroup(g.id, b.id)}
                    className={`px-3 py-1 rounded border text-sm ${inGroup ? 'bg-gray-200' : ''}`}
                    title={inGroup ? 'Already in group' : 'Add to group'}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>

            {!!g.bot_ids.length && <div className="text-xs text-gray-600 break-all">IDs: {g.bot_ids.join(', ')}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
