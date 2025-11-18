import { NextRequest, NextResponse } from 'next/server';
import { supabase_admin } from '../../../../../lib/supabase_admin';
import axios from 'axios';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

interface ChatbotData {
  personality: string;
  Users: {
    clerk_id: string;
    allowed_domains: string[];
  } | null;
}

export async function POST(req: NextRequest, context: { params: { id: string } }) {
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
    const requestHostname = origin ? new URL(origin).hostname : null;

    const { message: userMessage, conversation_id } = await req.json();
    const { id: chatbot_id } = await context.params;

    if (!userMessage) {
      return createResponse({ error: 'No message' }, 400);
    }

    // Fetching chatbot personality
    const { data: chatbot, error: chatbotError } = await supabase_admin
      .from('Chatbot')
      .select('personality, Users(clerk_id, allowed_domains)')
      .eq('id', chatbot_id)
      .single<ChatbotData>();

    if (chatbotError || !chatbot) {
      console.error('Supabase query failed:', chatbotError);
      return createResponse({ error: 'Chatbot not found' }, 404);
    }

    const userData = chatbot.Users;

    if (!userData) {
      console.error(`User data not found for chatbot ${chatbot_id}`);
      return createResponse({ error: 'Chatbot configuration error' }, 500);
    }
    const allowedDomains = userData?.allowed_domains || [];

    if (!requestHostname || !allowedDomains.includes(requestHostname)) {
      console.error(`Website'${requestHostname}' not in allowed list [${allowedDomains.join(', ')}]`);
      return createResponse({ error: 'Host not allowed' }, 403);
    }

    let history: Message[] = [];
    const current_conversation_id = conversation_id;

    if (current_conversation_id) {
      const { data: conversation } = await supabase_admin
        .from('Conversation')
        .select('messages, chatbot_id')
        .eq('id', current_conversation_id)
        .single();

      if (conversation) {
        if (conversation.chatbot_id !== chatbot_id) {
          return createResponse({ error: 'Conversation doesnt belong to this chatbot' }, 403);
        }
        history = conversation.messages;
      }
    }

    // Creating prompt for openrouter
    const messagesForAPI: Message[] = [
      { role: 'system', content: chatbot.personality },
      ...history,
      { role: 'user', content: userMessage },
    ];

    // prompting and storing conversation
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }

    const openrouterResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'kwaipilot/kat-coder-pro:free',
        messages: messagesForAPI,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Chatbot app',
        },
      }
    );

    const chatbotReply = openrouterResponse.data.choices[0].message.content;

    // Update convo history
    const newHistory: Message[] = [
      ...history,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: chatbotReply },
    ];

    if (current_conversation_id) {
      await supabase_admin.from('Conversation').update({ messages: newHistory }).eq('id', current_conversation_id);

      return createResponse({ reply: chatbotReply }, 200);
    } else {
      const { data: newConversation, error } = await supabase_admin
        .from('Conversation')
        .insert({ chatbot_id: chatbot_id, messages: newHistory })
        .select('id')
        .single();

      if (error || !newConversation) {
        console.error('Failed to create new conversation', error);
        return createResponse({ error: 'Failed to create new conversation' }, 500);
      }

      return createResponse({ reply: chatbotReply, conversation_id: newConversation.id }, 200);
    }
  } catch (error) {
    console.error('API error', error);
    return createResponse({ error: 'Failed to process prompt' }, 500);
  }
}
