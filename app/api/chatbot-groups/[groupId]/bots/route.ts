import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase_admin } from '@/lib/supabase_admin';

type Group = {
  id: string;
  name: string;
  assistant_ids: string[];
  created_at: string;
};

/**
 * Add assistants to a specific group.
 * This merges new assistant IDs into the group's assistant_ids array.
 */
export async function POST(req: Request, context: { params: Promise<{ groupId: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  // Await params in Next.js 15
  const { groupId } = await context.params;

  const { assistantIds } = await req.json();
  if (!Array.isArray(assistantIds))
    return NextResponse.json({ message: 'assistantIds must be an array' }, { status: 400 });

  const { data: existing, error: getErr } = await supabase_admin
    .from('Users')
    .select('chatbot_groups')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (getErr) {
    console.error('POST /chatbot-groups getErr:', getErr);
    return NextResponse.json({ message: getErr.message }, { status: 500 });
  }

  const groups: Group[] = (existing?.chatbot_groups ?? []) as Group[];
  const idx = groups.findIndex((g) => g.id === groupId);
  if (idx === -1) return NextResponse.json({ message: 'Group not found' }, { status: 404 });

  const merged = Array.from(new Set([...(groups[idx].assistant_ids || []), ...assistantIds]));
  const updatedGroups = [...groups];
  updatedGroups[idx] = { ...groups[idx], assistant_ids: merged };

  const { error: updErr } = await supabase_admin
    .from('Users')
    .update({ chatbot_groups: updatedGroups })
    .eq('clerk_id', clerkId);

  if (updErr) {
    console.error('POST /chatbot-groups updErr:', updErr);
    return NextResponse.json({ message: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, assistant_ids: merged });
}

/**
 * Delete a specific group for the current user.
 * If the group doesn't exist, returns success anyway (idempotent delete).
 */
export async function DELETE(_: Request, context: { params: Promise<{ groupId: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  // Await params in Next.js 15
  const { groupId } = await context.params;

  const { data: existing, error: getErr } = await supabase_admin
    .from('Users')
    .select('chatbot_groups')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (getErr) {
    console.error('DELETE /chatbot-groups getErr:', getErr);
    return NextResponse.json({ message: getErr.message }, { status: 500 });
  }

  const groups: Group[] = (existing?.chatbot_groups ?? []) as Group[];
  const before = groups.length;
  const updated = groups.filter((g) => g.id !== groupId);

  // Idempotent delete: return 200 even if not found
  if (updated.length === before) {
    console.warn('DELETE /chatbot-groups: group not found', {
      clerkId,
      groupId: groupId,
    });
    return NextResponse.json({ success: true });
  }

  const { error: updErr } = await supabase_admin
    .from('Users')
    .update({ chatbot_groups: updated })
    .eq('clerk_id', clerkId);

  if (updErr) {
    console.error('DELETE /chatbot-groups updErr:', updErr);
    return NextResponse.json({ message: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
