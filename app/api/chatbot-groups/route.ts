// app/api/chatbot-groups/route.ts
export const runtime = 'nodejs';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUserRowByClerkId, makeGroup, saveGroups } from '@/lib/groups';

async function getUserIdOrDev() {
  const { userId } = await auth();
  return userId ?? process.env.DEV_CLERK_ID ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdOrDev();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await req.json();
    const user = await getOrCreateUserRowByClerkId(userId);   // <— create if missing

    const newGrp = makeGroup(name || 'New group');
    const next = [newGrp, ...(user.chatbot_groups ?? [])];

    await saveGroups(user.id, next);
    return NextResponse.json(newGrp, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/chatbot-groups failed:', e);     // <— log to terminal
    return NextResponse.json({ error: e.message ?? 'Server error' }, { status: 500 });
  }
}
