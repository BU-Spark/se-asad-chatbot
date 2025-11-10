'use client';

import { useEffect, useState } from 'react';
import GroupPicker from '@/app/components/group-picker';

type Chatbot = { id: string; name: string; created_at?: string };

export default function ManageAssistantsPage() {
    const [bots, setBots] = useState<Chatbot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/chatbots');
                const text = await res.text();                 // read once
                const isJSON = res.headers.get('content-type')?.includes('application/json');
                const data = isJSON && text ? JSON.parse(text) : (text || null);

                if (!res.ok) throw new Error((data && data.error) || `HTTP ${res.status}`);

                setBots(Array.isArray(data) ? data : []);
            } catch (e: any) {
                setError(e.message || 'Failed to load assistants');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <main className="p-6">Loading…</main>;
    if (error) return <main className="p-6 text-red-500">Error: {error}</main>;

    return (
        <main className="p-6 space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Manage Assistants</h1>
                <a href="/assistant/groups" className="text-sm underline">Open Groups view</a>
            </header>

            {bots.length === 0 ? (
                <div className="text-sm text-gray-500">No assistants yet.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {bots.map(b => (
                        <div key={b.id} className="border rounded p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">{b.name}</div>
                                <div className="text-xs text-gray-500">{b.id}</div>
                            </div>
                            <GroupPicker chatbotId={b.id} />
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
