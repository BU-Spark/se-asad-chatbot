import { supabase_admin } from '@/lib/supabase_admin';
import axios from 'axios';
import { Message } from './types';

// prompting with openrouter
export async function getChatbotResponse(
  chatbotId: string,
  userMessage: string,
  conversationHistory: Message[]
): Promise<string> {
  const { data: chatbot, error: chatbotError } = await supabase_admin
    .from('Chatbot')
    .select('personality')
    .eq('id', chatbotId)
    .single();

  if (chatbotError || !chatbot) {
    console.error('Failed to fetch chatbot personality:', chatbotError);
    throw new Error('Chatbot configuration error');
  }

  const messagesForAPI = [
    { role: 'system' as const, content: chatbot.personality },
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

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
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL,
        'X-Title': 'Chatbot app',
      },
    }
  );

  return openrouterResponse.data.choices[0].message.content;
}
