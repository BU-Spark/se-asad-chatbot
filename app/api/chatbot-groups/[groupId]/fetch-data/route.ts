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

interface ChatbotConfig {
  id: string;
  name: string;
  personality: string;
}

interface ChatbotGroup {
  id: string;
  assistant_ids: string[];
}

export async function GET(req: NextRequest, context: { params: Promise<{ groupId: string }> }) {
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

  if (!groupId) {
    return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
  }

  try {
    const { data: userData, error: userError } = await supabase_admin
      .rpc('get_user_by_chatbot_group_id', {
        group_id_to_find: groupId,
      })
      .select('chatbot_groups')
      .maybeSingle();

    if (userError) {
      console.error('GET /fetch-data userError:', userError);
      return createResponse({ message: 'Configuration error' }, 500);
    }

    if (!userData || !userData.chatbot_groups) {
      return createResponse({ error: 'Chatbot group not found' }, 404);
    }

    const allGroups = userData.chatbot_groups as ChatbotGroup[];
    const targetGroup = allGroups.find((g) => g.id === groupId);

    if (!targetGroup) {
      return createResponse({ error: 'Group definition not found' }, 404);
    }

    const assistantIds = targetGroup.assistant_ids;

    if (!assistantIds || assistantIds.length === 0) {
      return createResponse([], 200);
    }

    const { data: assistantsData, error: assistantsError } = await supabase_admin
      .from('Chatbot')
      .select('id, name, personality')
      .in('id', assistantIds);

    if (assistantsError) {
      console.error('GET /fetch-data assistantsError:', assistantsError);
      return createResponse({ message: assistantsError.message }, 500);
    }

    return createResponse(assistantsData as ChatbotConfig[], 200);
  } catch (error: unknown) {
    console.error('GET /fetch-data unhandled exception:', error);
    return createResponse({ message: 'An internal server error occurred' }, 500);
  }
}
