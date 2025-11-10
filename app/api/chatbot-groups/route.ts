import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase_admin } from '@/lib/supabase_admin';

type Group = { id: string; name: string; assistant_ids: string[]; created_at: string };

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json([]);

  const { data, error } = await supabase_admin
    .from('Users')
    .select('chatbot_groups')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const groups: Group[] = (data?.chatbot_groups ?? []) as Group[];
  return NextResponse.json(groups);
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ message: 'Missing name' }, { status: 400 });

  const newGroup: Group = {
    id: crypto.randomUUID(),
    name,
    assistant_ids: [],
    created_at: new Date().toISOString(),
  };

  const { data: existing, error: getErr } = await supabase_admin
    .from('Users')
    .select('chatbot_groups')
    .eq('clerk_id', clerkId)
    .maybeSingle();
  if (getErr) return NextResponse.json({ message: getErr.message }, { status: 500 });

  const current: Group[] = (existing?.chatbot_groups ?? []) as Group[];
  const updated = [newGroup, ...current];

  const { error: updErr } = await supabase_admin
    .from('Users')
    .update({ chatbot_groups: updated })
    .eq('clerk_id', clerkId);

  if (updErr) return NextResponse.json({ message: updErr.message }, { status: 500 });
  return NextResponse.json(newGroup);
}
