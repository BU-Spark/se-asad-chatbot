// app/api/chatbot-groups/[groupId]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase_admin } from '@/lib/supabase_admin';

type Group = {
  id: string;
  name: string;
  assistant_ids: string[];
  created_at: string;
};

/** Add assistants to a specific group (merges, de-dupes). */
export async function POST(req: Request, { params }: { params: { groupId: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const assistantIds: string[] =
    Array.isArray(body.assistantIds) ? body.assistantIds
    : body.chatbotId ? [String(body.chatbotId)]
    : [];

  if (assistantIds.length === 0) {
    return NextResponse.json({ message: 'assistantIds must be non-empty' }, { status: 400 });
  }

  const { data: existing, error: getErr } = await supabase_admin
    .from('Users')
    .select('chatbot_groups')
    .eq('clerk_id', clerkId)
    .maybeSingle();
  if (getErr) return NextResponse.json({ message: getErr.message }, { status: 500 });

  const groups: Group[] = (existing?.chatbot_groups ?? []) as Group[];
  const idx = groups.findIndex(g => String(g.id) === String(params.groupId));
  if (idx === -1) return NextResponse.json({ message: 'Group not found' }, { status: 404 });

  const merged = Array.from(new Set([...(groups[idx].assistant_ids || []), ...assistantIds]));
  const updatedGroups = [...groups];
  updatedGroups[idx] = { ...groups[idx], assistant_ids: merged };

  const { error: updErr } = await supabase_admin
    .from('Users')
    .update({ chatbot_groups: updatedGroups })
    .eq('clerk_id', clerkId);
  if (updErr) return NextResponse.json({ message: updErr.message }, { status: 500 });

  // return id so the client can patch the right card
  return NextResponse.json({ id: params.groupId, assistant_ids: merged });
}

/** Delete a specific group (idempotent). */
export async function DELETE(_: Request, { params }: { params: { groupId: string } }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data: existing, error: getErr } = await supabase_admin
    .from('Users')
    .select('chatbot_groups')
    .eq('clerk_id', clerkId)
    .maybeSingle();
  if (getErr) return NextResponse.json({ message: getErr.message }, { status: 500 });

  const groups: Group[] = (existing?.chatbot_groups ?? []) as Group[];
  const before = groups.length;
  const updated = groups.filter(g => String(g.id) !== String(params.groupId));

  // idempotent: success even if not found
  if (updated.length === before) {
    return NextResponse.json({ success: true });
  }

  const { error: updErr } = await supabase_admin
    .from('Users')
    .update({ chatbot_groups: updated })
    .eq('clerk_id', clerkId);
  if (updErr) return NextResponse.json({ message: updErr.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
