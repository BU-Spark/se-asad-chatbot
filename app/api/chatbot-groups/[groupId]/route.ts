import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase_admin } from '@/lib/supabase_admin';

type Group = { id: string; name: string; deleted_at?: string | null };

export async function DELETE(req: Request, { params }: { params: Promise<{ groupId: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { groupId } = await params;

  const { data: user, error: fetchErr } = await supabase_admin
    .from('Users')
    .select('chatbot_groups')
    .eq('clerk_id', clerkId)
    .single();

  if (fetchErr || !user) {
    return NextResponse.json({ message: 'User not found' }, { status: 500 });
  }

  const groups = (user.chatbot_groups ?? []) as Group[];
  const groupIndex = groups.findIndex((g) => g.id === groupId);

  if (groupIndex === -1) {
    return NextResponse.json({ message: 'Group not found' }, { status: 404 });
  }

  // Timestamp based rather than boolean
  groups[groupIndex].deleted_at = new Date().toISOString();

  const { error: updateErr } = await supabase_admin
    .from('Users')
    .update({ chatbot_groups: groups })
    .eq('clerk_id', clerkId);

  if (updateErr) {
    return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
