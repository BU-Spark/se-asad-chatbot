// app/chat/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
    const chatbotId = process.env.NEXT_PUBLIC_CHATBOT_ID;
    const [messages, setMessages] = useState<Msg[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, loading]);

    async function send() {
        if (!input.trim() || !chatbotId) return;
        const userText = input.trim();
        setInput("");
        setMessages((m) => [...m, { role: "user", content: userText }]);
        setLoading(true);
        try {
            const res = await fetch(`/api/chatbots/${chatbotId}/prompt`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userText,
                    conversation_id: conversationId ?? undefined,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || `Request failed with ${res.status}`);
            }

            const data = await res.json();
            if (data.conversation_id && !conversationId) setConversationId(data.conversation_id);

            const reply: string = data.reply ?? "(no reply)";
            setMessages((m) => [...m, { role: "assistant", content: reply }]);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            setMessages((m) => [...m, { role: "assistant", content: `Error: ${msg}` }]);
        } finally {
            setLoading(false);
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900">
            <div className="mx-auto max-w-3xl px-4 py-6">
                <header className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Chat</h1>
                    <div className="text-xs text-neutral-500">
                        Bot: <code>{chatbotId ?? "not set"}</code>
                    </div>
                </header>

                <div
                    ref={scrollerRef}
                    className="h-[65vh] w-full overflow-y-auto rounded-2xl border bg-white p-4 shadow-sm"
                >
                    {messages.length === 0 ? (
                        <div className="h-full grid place-items-center text-neutral-400">
                            Say hi to get started
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {messages.map((m, i) => (
                                <li
                                    key={i}
                                    className={
                                        m.role === "user"
                                            ? "flex justify-end"
                                            : "flex justify-start"
                                    }
                                >
                                    <div
                                        className={
                                            m.role === "user"
                                                ? "max-w-[80%] rounded-2xl bg-black px-4 py-2 text-white"
                                                : "max-w-[80%] rounded-2xl bg-neutral-100 px-4 py-2"
                                        }
                                    >
                                        {m.content}
                                    </div>
                                </li>
                            ))}
                            {loading && (
                                <li className="flex justify-start">
                                    <div className="rounded-2xl bg-neutral-100 px-4 py-2 italic text-neutral-500">
                                        thinking…
                                    </div>
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                <div className="mt-4 flex gap-2">
                    <input
                        className="flex-1 rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="Type a message"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                    <button
                        onClick={send}
                        disabled={loading || !input.trim() || !chatbotId}
                        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>

                {!chatbotId && (
                    <p className="mt-3 text-sm text-red-600">
                        NEXT_PUBLIC_CHATBOT_ID is not set. Add it to .env.local and restart dev server.
                    </p>
                )}
            </div>
        </div>
    );
}
