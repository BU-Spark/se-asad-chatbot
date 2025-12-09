import { NextRequest, NextResponse } from 'next/server';
import { supabase_admin } from '@/lib/supabase_admin';

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');

  if (!origin) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  chatbot_id: string;
  messages: Message[];
}

interface ChatbotGroup {
  id: string;
  assistant_ids: string[];
}

export async function GET(req: NextRequest, context: { params: Promise<{ groupId: string; conversationId: string }> }) {
  const origin = req.headers.get('origin');

  const createResponse = (body: unknown, status: number) => {
    return new NextResponse(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '',
      },
    });
  };

  try {
    const params = await context.params;
    const groupId = params.groupId;
    const conversationId = params.conversationId;

    console.log('Fetching conversation:', { groupId, conversationId });

    if (!groupId) {
      console.error('Missing groupId');
      return createResponse({ error: 'Group ID is required' }, 400);
    }

    if (!conversationId) {
      console.error('Missing conversationId');
      return createResponse({ error: 'Conversation ID is required' }, 400);
    }

    // Verify the group exists and get its chatbot IDs
    const { data: userData, error: userError } = await supabase_admin
      .rpc('get_user_by_chatbot_group_id', {
        group_id_to_find: groupId,
      })
      .select('chatbot_groups')
      .maybeSingle();

    if (userError || !userData) {
      console.error('GET /conversations userError:', userError);
      return createResponse({ error: 'Configuration error' }, 500);
    }

    const allGroups = userData.chatbot_groups as ChatbotGroup[];
    const targetGroup = allGroups.find((g) => g.id === groupId);

    if (!targetGroup) {
      return createResponse({ error: 'Group not found' }, 404);
    }

    const allowedChatbotIds = targetGroup.assistant_ids || [];

    if (allowedChatbotIds.length === 0) {
      return createResponse({ error: 'Group has no chatbots' }, 400);
    }

    // Fetch the conversation
    const { data: conversationData, error: conversationError } = await supabase_admin
      .from('Conversation')
      .select('id, chatbot_id, messages')
      .eq('id', conversationId)
      .maybeSingle();

    if (conversationError) {
      console.error('GET /conversations conversationError:', conversationError);
      return createResponse({ error: 'Database error', message: conversationError.message }, 500);
    }

    if (!conversationData) {
      console.log('Conversation not found');
      return createResponse({ error: 'Conversation not found' }, 404);
    }

    const conversation = conversationData as Conversation;

    // Verify the conversation belongs to a chatbot in this group
    if (!allowedChatbotIds.includes(conversation.chatbot_id)) {
      console.log('Conversation does not belong to this group');
      return createResponse({ error: 'Conversation not found' }, 404);
    }

    console.log('Conversation found:', conversation.id, 'Messages count:', conversation.messages?.length || 0);

    // This prevents chatbot_id from being exposed
    return createResponse(
      {
        id: conversation.id,
        messages: conversation.messages || [],
      },
      200
    );
  } catch (error: unknown) {
    console.error('GET /conversations unhandled exception:', error);
    return createResponse({ error: 'An internal server error occurred' }, 500);
  }
}
