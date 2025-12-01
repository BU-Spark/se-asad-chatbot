import { NextRequest, NextResponse } from 'next/server';
import { supabase_admin } from '@/lib/supabase_admin';
import { routeToChatbot, generateClarificationMessage } from './routing';
import { getChatbotResponse } from './llm';
import { ChatbotGroup, Message, Conversation, ChatbotWithDescription, CLARIFICATION_BOT_ID } from './types';

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
    const { message, conversation_id } = await req.json();

    if (!message || typeof message !== 'string') {
      return createResponse({ error: 'Message is required' }, 400);
    }

    // Get the chatbot group configuration
    const { data: userData, error: userError } = await supabase_admin
      .rpc('get_user_by_chatbot_group_id', {
        group_id_to_find: groupId,
      })
      .select('chatbot_groups')
      .maybeSingle();

    if (userError || !userData) {
      console.error('POST /prompt userError:', userError);
      return createResponse({ error: 'Configuration error' }, 500);
    }

    const allGroups = userData.chatbot_groups as ChatbotGroup[];
    const targetGroup = allGroups.find((g) => g.id === groupId);

    if (!targetGroup || !targetGroup.assistant_ids || targetGroup.assistant_ids.length === 0) {
      return createResponse({ error: 'No chatbots available' }, 400);
    }

    const availableChatbotIds = targetGroup.assistant_ids;

    // Fetch chatbot names and descriptions for routing
    const { data: chatbotsData, error: chatbotsError } = await supabase_admin
      .from('Chatbot')
      .select('id, name, description')
      .in('id', availableChatbotIds);

    if (chatbotsError || !chatbotsData || chatbotsData.length === 0) {
      console.error('Failed to fetch chatbot details:', chatbotsError);
      return createResponse({ error: 'No chatbots available' }, 500);
    }

    const chatbotsWithDescriptions = chatbotsData as ChatbotWithDescription[];

    // Load existing conversation if exist
    let conversationData: Conversation | null = null;
    let conversationHistory: Message[] = [];

    if (conversation_id) {
      const { data, error } = await supabase_admin
        .from('Conversation')
        .select('id, chatbot_id, messages')
        .eq('id', conversation_id)
        .maybeSingle();

      if (!error && data) {
        conversationData = data as Conversation;
        conversationHistory = conversationData.messages || [];
      }
    }

    // Route to appropriate chatbot based on descriptions
    const { chatbotId: selectedChatbotId } = await routeToChatbot(message, chatbotsWithDescriptions);

    let botResponse: string;

    // If clarification bot is selected, generate clarification message
    if (selectedChatbotId === CLARIFICATION_BOT_ID) {
      botResponse = generateClarificationMessage(chatbotsWithDescriptions);

      // Save conversation with clarification (don't save chatbot_id for clarification)
      const newUserMessage: Message = { role: 'user', content: message };
      const newAssistantMessage: Message = { role: 'assistant', content: botResponse };
      const updatedMessages = [...conversationHistory, newUserMessage, newAssistantMessage];

      let finalConversationId = conversation_id;

      if (conversationData) {
        await supabase_admin.from('Conversation').update({ messages: updatedMessages }).eq('id', conversation_id);
      } else {
        const { data: newConversation, error: insertError } = await supabase_admin
          .from('Conversation')
          .insert({
            chatbot_id: availableChatbotIds[0], // Use first bot as placeholder
            messages: updatedMessages,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error creating conversation:', insertError);
          return createResponse({ error: 'Failed to save conversation' }, 500);
        }

        finalConversationId = newConversation.id;
      }

      return createResponse({ reply: botResponse, conversation_id: finalConversationId }, 200);
    }

    // Get response from the selected chatbot
    botResponse = await getChatbotResponse(selectedChatbotId, message, conversationHistory);

    // Save conversation
    const newUserMessage: Message = { role: 'user', content: message };
    const newAssistantMessage: Message = { role: 'assistant', content: botResponse };
    const updatedMessages = [...conversationHistory, newUserMessage, newAssistantMessage];

    let finalConversationId = conversation_id;

    if (conversationData) {
      const { error: updateError } = await supabase_admin
        .from('Conversation')
        .update({
          chatbot_id: selectedChatbotId,
          messages: updatedMessages,
        })
        .eq('id', conversation_id);

      if (updateError) {
        console.error('Error updating conversation:', updateError);
      }
    } else {
      const { data: newConversation, error: insertError } = await supabase_admin
        .from('Conversation')
        .insert({
          chatbot_id: selectedChatbotId,
          messages: updatedMessages,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating conversation:', insertError);
        return createResponse({ error: 'Failed to save conversation' }, 500);
      }

      finalConversationId = newConversation.id;
    }

    return createResponse({ reply: botResponse, conversation_id: finalConversationId }, 200);
  } catch (error: unknown) {
    console.error('POST /prompt unhandled exception:', error);
    return createResponse({ error: 'An internal server error occurred' }, 500);
  }
}
