// lib/groups.ts
import { supabase_admin } from '@/lib/supabase_admin';

export async function getUserRowByClerkId(clerkId: string) {
  const { data, error } = await supabase_admin
    .from('Users')
    .select('id, clerk_id, chatbot_groups')
    .eq('clerk_id', clerkId)
    .maybeSingle();                       // <— was .single()
  if (error) throw new Error(error.message);
  if (!data) throw new Error('User row not found');
  return data as { id: string; clerk_id: string; chatbot_groups: any[] | null };
}

// create-if-missing helper:
export async function getOrCreateUserRowByClerkId(clerkId: string) {
  const { data, error } = await supabase_admin
    .from('Users')
    .select('id, clerk_id, chatbot_groups')
    .eq('clerk_id', clerkId)
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (data) return data as { id: string; clerk_id: string; chatbot_groups: any[] | null };

  const insert = await supabase_admin
    .from('Users')
    .insert({ clerk_id: clerkId, chatbot_groups: [] })
    .select('id, clerk_id, chatbot_groups')
    .single();

  if (insert.error) throw new Error(insert.error.message);
  return insert.data as { id: string; clerk_id: string; chatbot_groups: any[] | null };
}

export function makeGroup(name: string) {
  return { id: `grp_${crypto.randomUUID()}`, name, bot_ids: [] as string[], created_at: new Date().toISOString() };
}

export async function saveGroups(userRowId: string, groups: any[]) {
  const { error } = await supabase_admin.from('Users').update({ chatbot_groups: groups }).eq('id', userRowId);
  if (error) throw new Error(error.message);
}
