import { NextRequest, NextResponse } from 'next/server';
import { supabase_admin } from '../../../../../lib/supabase_admin';
import { openrouter } from '../../../../../lib/openrouter';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    const chatbot_id = context.params.id;
    const { message: userMessage, conversation_id } = await req.json();

    if (!userMessage) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    // Fetch chatbot personality
    const { data: chatbot, error: chatbotError } = await supabase_admin
      .from('Chatbot')
      .select('personality')
      .eq('id', chatbot_id)
      .single();

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // Load previous messages if conversation exists
    let history: Message[] = [];
    if (conversation_id) {
      const { data: conversation } = await supabase_admin
        .from('Conversation')
        .select('messages, chatbot_id')
        .eq('id', conversation_id)
        .single();

      if (conversation) {
        if (conversation.chatbot_id !== chatbot_id) {
          return NextResponse.json({ error: 'Conversation does not belong to this chatbot' }, { status: 403 });
        }
        history = Array.isArray(conversation.messages) ? conversation.messages : [];
      }
    }

    // Create the prompt for OpenRouter
    const messagesForAPI: Message[] = [
      { role: 'system', content: chatbot.personality },
      ...history,
      { role: 'user', content: userMessage },
    ];

    // Send to OpenRouter
    const completion = await openrouter.chat({
      messages: messagesForAPI,
      temperature: 0.7,
    });

    const chatbotReply = completion.content ?? 'No reply generated.';
    try {
      await supabase_admin.from('MessageHistory').insert([
        {
          conversation_id,
          role: 'user',
          content: userMessage,
          model_used: completion.model,
        },
        {
          conversation_id,
          role: 'assistant',
          content: chatbotReply,
          model_used: completion.model,
        },
      ]);
    } catch (err) {
      console.warn('MessageHistory logging skipped:', err.message);
    }

    // Log usage and cost (optional)
    try {
      if (completion.usage || completion.cost) {
        await supabase_admin.from('UsageCost').insert({
          conversation_id,
          model: completion.model,
          total_tokens: completion.usage?.total_tokens ?? null,
          prompt_tokens: completion.usage?.prompt_tokens ?? null,
          completion_tokens: completion.usage?.completion_tokens ?? null,
          cost: completion.cost ?? null,
        });
      }
    } catch (err) {
      console.warn('UsageCost logging skipped:', err.message);
    }

    // Update or create conversation
    const newHistory: Message[] = [
      ...history,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: chatbotReply },
    ];

    if (conversation_id) {
      await supabase_admin.from('Conversation').update({ messages: newHistory }).eq('id', conversation_id);

      return NextResponse.json({ reply: chatbotReply, model: usedModel, usage, cost }, { status: 200 });
    } else {
      const { data: newConversation, error } = await supabase_admin
        .from('Conversation')
        .insert({ chatbot_id, messages: newHistory })
        .select('id')
        .single();

      if (error || !newConversation) {
        return NextResponse.json({ error: 'Failed to create new conversation' }, { status: 500 });
      }

      return NextResponse.json(
        { reply: chatbotReply, conversation_id: newConversation.id, model: usedModel, usage, cost },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error('API error', err);
    const message = err instanceof Error ? err.message : 'Failed to process prompt';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
