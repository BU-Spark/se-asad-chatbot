// lib/assistantsStore.ts
export type Assistant = { id: string; name: string; personality: string; createdAt: string };
export const assistants: Assistant[] = []; // in-memory; resets on dev server restart
