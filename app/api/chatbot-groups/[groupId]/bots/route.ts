// app/api/chatbot-groups/[groupId]/bots/route.ts
export const runtime = 'nodejs';

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUserRowByClerkId, saveGroups, assertBotOwnedByUser } from '@/lib/groups';

async function getUserIdOrDev() {
  const { userId } = await auth();
  return userId ?? process.env.DEV_CLERK_ID ?? null;
}

export async function POST(req: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const userId = await getUserIdOrDev();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const groupId = params.groupId;
    const body = await req.json().catch(() => null) as { chatbotId?: string } | null;
    const chatbotId = body?.chatbotId;
    if (!groupId || !chatbotId) {
      return NextResponse.json({ error: 'groupId/chatbotId required' }, { status: 400 });
    }

    await assertBotOwnedByUser(chatbotId, userId);

    const user = await getUserRowByClerkId(userId);
    const groups = (user.chatbot_groups ?? []) as any[];
    const idx = groups.findIndex(g => g?.id === groupId);
    if (idx === -1) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    const bot_ids: string[] = Array.from(new Set([...(groups[idx].bot_ids ?? []), chatbotId]));
    const updated = { ...groups[idx], bot_ids };
    const next = [...groups];
    next[idx] = updated;

    await saveGroups(user.id, next);
    return NextResponse.json(updated, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Server error' }, { status: 500 });
  }
}
