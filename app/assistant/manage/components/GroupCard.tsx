"use client";

import React from "react";

type Group = {
    id: string;
    name: string;
    assistant_ids: string[];
};

type Props = {
    group: Group;
    onAddSelected: () => void;
    onDelete: () => void;
};

export function GroupCard({ group, onAddSelected, onDelete }: Props) {
    const count = group.assistant_ids.length;

    return (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-sm shadow-[0_12px_32px_rgba(15,23,42,0.85)] transition hover:border-neutral-700">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h4 className="text-sm font-medium text-neutral-50">{group.name}</h4>
                    <p className="mt-1 text-[11px] text-neutral-400">
                        {count} assistant{count === 1 ? "" : "s"}
                    </p>
                </div>

                <span className="inline-flex items-center rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300">
                    {count}
                </span>
            </div>

            <div className="mt-3 flex gap-2">
                <button
                    type="button"
                    onClick={onAddSelected}
                    className="flex-1 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-50 transition hover:bg-neutral-700"
                >
                    Add selected
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-lg bg-red-900/30 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-700/60"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
