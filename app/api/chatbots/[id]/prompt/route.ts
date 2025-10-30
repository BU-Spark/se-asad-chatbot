import { NextRequest, NextResponse } from 'next/server';
import { supabase_admin } from '../../../../../lib/supabase_admin';
import axios from 'axios';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    const chatbot_id = context.params.id;
    const { message: userMessage, conversation_id } = await req.json();

    if (!userMessage) {
      return NextResponse.json({ error: 'No message' }, { status: 400 });
    }

    // Fetching chatbot personality
    const { data: chatbot, error: chatbotError } = await supabase_admin
      .from('Chatbot')
      .select('personality')
      .eq('id', chatbot_id)
      .single();

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
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
          return NextResponse.json({ error: 'Conversation doesnt belong to this chatbot' }, { status: 403 });
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
        model: 'openai/gpt-5',
        messages: messagesForAPI,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
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

      return NextResponse.json({ reply: chatbotReply }, { status: 200 });
    } else {
      const { data: newConversation, error } = await supabase_admin
        .from('Conversation')
        .insert({ chatbot_id: chatbot_id, messages: newHistory })
        .select('id')
        .single();

      if (error || !newConversation) {
        console.error('Failed to create new conversation', error);
        return NextResponse.json({ error: 'Failed to create new conversation' }, { status: 500 });
      }

      return NextResponse.json({ reply: chatbotReply, conversation_id: newConversation.id }, { status: 200 });
    }
  } catch (error) {
    console.error('API error', error);
    return NextResponse.json({ error: 'Failed to process prompt' }, { status: 500 });
  }
}
