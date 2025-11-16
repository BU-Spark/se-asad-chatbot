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

export async function GET(req: NextRequest, context: { params: Promise<{ id: string; conversationId: string }> }) {
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
    const chatbotId = params.id;
    const conversationId = params.conversationId;

    console.log('Fetching conversation:', { chatbotId, conversationId });

    if (!chatbotId) {
      console.error('Missing chatbotId');
      return createResponse({ error: 'Chatbot ID is required' }, 400);
    }

    if (!conversationId) {
      console.error('Missing conversationId');
      return createResponse({ error: 'Conversation ID is required' }, 400);
    }

    const { data: conversationData, error: conversationError } = await supabase_admin
      .from('Conversation')
      .select('id, chatbot_id, messages')
      .eq('id', conversationId)
      .eq('chatbot_id', chatbotId)
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

    console.log('Conversation found:', conversation.id, 'Messages count:', conversation.messages?.length || 0);

    return createResponse(
      { id: conversation.id, chatbot_id: conversation.chatbot_id, messages: conversation.messages || [] },
      200
    );
  } catch (error: unknown) {
    console.error('GET /conversations unhandled exception:', error);
    return createResponse({ error: 'An internal server error occurred' }, 500);
  }
}
