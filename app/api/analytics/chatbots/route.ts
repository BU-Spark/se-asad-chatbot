import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase_admin } from '@/lib/supabase_admin';

interface ChatbotUsage {
  id: string;
  name: string;
  totalTokens: number;
  conversationCount: number;
  lastUsed: string | null;
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all chatbots for this user
    const { data: chatbots, error: chatbotsError } = await supabase_admin
      .from('Chatbot')
      .select('id, name, created_at')
      .eq('user_id', clerkId);

    if (chatbotsError) {
      console.error('Error fetching chatbots:', chatbotsError);
      return NextResponse.json({ error: 'Failed to fetch chatbots' }, { status: 500 });
    }

    if (!chatbots || chatbots.length === 0) {
      return NextResponse.json([]);
    }

    // Get usage data for each chatbot
    const chatbotUsagePromises = chatbots.map(async (chatbot) => {
      // Get total tokens for this chatbot
      const { data: usageData, error: usageError } = await supabase_admin
        .from('Usage')
        .select('total_tokens, timestamp')
        .eq('chatbot_id', chatbot.id);

      if (usageError) {
        console.error(`Error fetching usage for chatbot ${chatbot.id}:`, usageError);
      }

      const totalTokens = usageData?.reduce((sum, record) => sum + (record.total_tokens || 0), 0) || 0;

      // Get last used timestamp
      const lastUsed =
        usageData && usageData.length > 0
          ? usageData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp
          : null;

      // Get conversation count for this chatbot
      const { data: conversations, error: convError } = await supabase_admin
        .from('Conversation')
        .select('id')
        .eq('chatbot_id', chatbot.id);

      if (convError) {
        console.error(`Error fetching conversations for chatbot ${chatbot.id}:`, convError);
      }

      const conversationCount = conversations?.length || 0;

      return {
        id: chatbot.id,
        name: chatbot.name,
        totalTokens,
        conversationCount,
        lastUsed,
      } as ChatbotUsage;
    });

    const chatbotUsage = await Promise.all(chatbotUsagePromises);

    // Sort by total tokens descending (highest first)
    const sortedUsage = chatbotUsage.sort((a, b) => b.totalTokens - a.totalTokens);

    return NextResponse.json(sortedUsage);
  } catch (error) {
    console.error('Analytics chatbots error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
