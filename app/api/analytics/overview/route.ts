import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase_admin } from '@/lib/supabase_admin';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total chatbot count for this user
    const { data: chatbots, error: chatbotsError } = await supabase_admin
      .from('Chatbot')
      .select('id')
      .eq('user_id', clerkId);

    if (chatbotsError) {
      console.error('Error fetching chatbots:', chatbotsError);
      return NextResponse.json({ error: 'Failed to fetch chatbots' }, { status: 500 });
    }

    const chatbotIds = chatbots?.map((c) => c.id) || [];
    const chatbotCount = chatbotIds.length;

    // Get total token usage across all user's chatbots
    let totalTokens = 0;
    if (chatbotIds.length > 0) {
      const { data: usageData, error: usageError } = await supabase_admin
        .from('Usage')
        .select('total_tokens')
        .in('chatbot_id', chatbotIds);

      if (usageError) {
        console.error('Error fetching usage:', usageError);
      } else {
        totalTokens = usageData?.reduce((sum, record) => sum + (record.total_tokens || 0), 0) || 0;
      }
    }

    // Get chatbot groups count
    const { data: userData, error: userError } = await supabase_admin
      .from('Users')
      .select('chatbot_groups')
      .eq('clerk_id', clerkId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user groups:', userError);
    }

    const groups = (userData?.chatbot_groups || []) as Array<{ id: string; name: string; assistant_ids: string[] }>;
    const groupCount = groups.length;

    return NextResponse.json({
      totalTokens,
      chatbotCount,
      groupCount,
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
