import { supabase_admin } from '../supabase_admin';
import { Conversation, SummariesData } from '../types/conversation';

/**
 * Fetches all conversations from the database
 */
export async function getAllConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase_admin
    .from('Conversation')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }

  return data as Conversation[];
}

/**
 * Fetches conversations that need summarization
 * (those with at least 5 new messages since last summary)
 *
 * @param minNewMessages - Minimum number of new messages required (default: 5)
 */
export async function getConversationsNeedingSummarization(minNewMessages: number = 5): Promise<Conversation[]> {
  const allConversations = await getAllConversations();

  return allConversations.filter((conversation) => {
    // Skip if no messages
    if (!conversation.messages || conversation.messages.length === 0) {
      return false;
    }

    const totalMessages = conversation.messages.length;
    const lastProcessedIndex = conversation.summaries?.last_processed_index ?? 0;
    const newMessages = totalMessages - lastProcessedIndex;

    return newMessages >= minNewMessages;
  });
}

/**
 * Updates a conversation's summaries field
 */
export async function updateConversationSummaries(conversationId: string, summariesData: SummariesData): Promise<void> {
  const { error } = await supabase_admin
    .from('Conversation')
    .update({ summaries: summariesData })
    .eq('id', conversationId);

  if (error) {
    console.error(`Error updating conversation ${conversationId}:`, error);
    throw error;
  }

  console.log(`✅ Updated conversation ${conversationId} with new summary`);
}

/**
 * Gets a specific conversation by ID
 */
export async function getConversationById(id: string): Promise<Conversation | null> {
  const { data, error } = await supabase_admin.from('Conversation').select('*').eq('id', id).single();

  if (error) {
    console.error(`Error fetching conversation ${id}:`, error);
    return null;
  }

  return data as Conversation;
}
