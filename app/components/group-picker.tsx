'use client';

import { useEffect, useMemo, useState } from 'react';

type Group = { id: string; name: string; bot_ids: string[]; created_at: string };

export default function GroupPicker({ chatbotId }: { chatbotId: string }) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selected, setSelected] = useState('');
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        (async () => {
            const res = await fetch('/api/chatbot-groups');
            const data = await res.json();
            setGroups(Array.isArray(data) ? data : []);
            setLoading(false);
        })();
    }, []);

    const alreadyIn = useMemo(
        () => new Set(groups.filter(g => g.bot_ids?.includes(chatbotId)).map(g => g.id)),
        [groups, chatbotId]
    );

    async function addToGroup(groupId: string) {
        if (!groupId) return;
        setBusy(true);
        const res = await fetch(`/api/chatbot-groups/${groupId}/bots`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatbotId }),
        });
        const updated = await res.json();
        setBusy(false);
        if (!res.ok) return alert(updated?.error || 'Add failed');
        setGroups(prev => prev.map(g => (g.id === updated.id ? updated : g)));
    }

    async function createGroup() {
        const name = newName.trim();
        if (!name) return;
        setBusy(true);
        const res = await fetch('/api/chatbot-groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        const grp = await res.json();
        setBusy(false);
        if (!res.ok) return alert(grp?.error || 'Create failed');
        setGroups(prev => [grp, ...prev]);
        setSelected(grp.id);
        setNewName('');
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <select
                    className="border rounded px-2 py-1"
                    value={selected}
                    onChange={e => setSelected(e.target.value)}
                    disabled={loading || busy}
                >
                    <option value="">{loading ? 'Loading…' : 'Select group'}</option>
                    {groups.map(g => (
                        <option key={g.id} value={g.id} disabled={alreadyIn.has(g.id)}>
                            {g.name}{alreadyIn.has(g.id) ? ' (added)' : ''}
                        </option>
                    ))}
                </select>
                <button
                    className="border rounded px-3 py-1"
                    onClick={() => addToGroup(selected)}
                    disabled={!selected || busy}
                >
                    Add
                </button>
            </div>

            <div className="flex items-center gap-2">
                <input
                    className="border rounded px-2 py-1"
                    placeholder="New group name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    disabled={busy}
                />
                <button className="border rounded px-3 py-1" onClick={createGroup} disabled={busy}>
                    Create group
                </button>
            </div>

            {!!alreadyIn.size && (
                <div className="text-xs text-gray-500">
                    In: {groups.filter(g => alreadyIn.has(g.id)).map(g => g.name).join(', ')}
                </div>
            )}
        </div>
    );
}
