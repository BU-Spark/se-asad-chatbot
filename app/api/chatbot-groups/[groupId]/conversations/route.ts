import { NextRequest, NextResponse } from 'next/server';
import { supabase_admin } from '@/lib/supabase_admin';
import { validateChatbotGroup } from '@/lib/validation';

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');

  if (!origin) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest, context: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await context.params;
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
    const body = await req.json();
    const { initialMessage } = body;

    const validation = await validateChatbotGroup(groupId);

    if (!validation.success) {
      return createResponse({ error: validation.error }, validation.status!);
    }

    const targetGroup = validation.group!;

    const allowedChatbotIds = targetGroup.assistant_ids || [];

    if (allowedChatbotIds.length === 0) {
      return createResponse({ error: 'Group has no chatbots' }, 400);
    }

    const messages: Message[] = [];

    if (initialMessage && initialMessage.role && initialMessage.content) {
      messages.push({
        role: initialMessage.role,
        content: initialMessage.content,
      });
    }

    const { data: newConversation, error: insertError } = await supabase_admin
      .from('Conversation')
      .insert({
        chatbot_id: allowedChatbotIds[0], // Use first bot as placeholder
        messages: messages,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating conversation:', insertError);
      return createResponse({ error: 'Failed to create conversation' }, 500);
    }

    console.log('Created conversation:', newConversation.id);

    return createResponse(
      {
        conversation_id: newConversation.id,
        messages: messages,
      },
      200
    );
  } catch (error: unknown) {
    console.error('POST /conversations unhandled exception:', error);
    return createResponse({ error: 'An internal server error occurred' }, 500);
  }
}
