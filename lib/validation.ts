import { supabase_admin } from '@/lib/supabase_admin';

interface ChatbotGroup {
  id: string;
  assistant_ids: string[];
}

export async function validateChatbotGroup(groupId: string) {
  const { data: userData, error: userError } = await supabase_admin
    .rpc('get_user_by_chatbot_group_id', {
      group_id_to_find: groupId,
    })
    .select('chatbot_groups')
    .maybeSingle();

  if (userError) {
    console.error('Validation RPC error:', userError);
    return { success: false, status: 500, error: 'Configuration error' };
  }

  if (!userData || !userData.chatbot_groups) {
    return { success: false, status: 404, error: 'Chatbot group not found' };
  }

  const allGroups = userData.chatbot_groups as ChatbotGroup[];
  const targetGroup = allGroups.find((g) => g.id === groupId);

  if (!targetGroup) {
    return { success: false, status: 404, error: 'Group not found' };
  }

  if (!targetGroup.assistant_ids || targetGroup.assistant_ids.length === 0) {
    return { success: false, status: 400, error: 'Group has no chatbots configured' };
  }

  return { success: true, group: targetGroup };
}
