import axios from 'axios';
import { ChatbotWithDescription, CLARIFICATION_BOT_ID } from './types';

interface RoutingResponse {
  chatbotId: string;
  clarificationMessage?: string;
}

export async function routeToChatbot(
  userMessage: string,
  chatbotsWithDescriptions: ChatbotWithDescription[],
  conversationHistory: { role: string; content: string }[]
): Promise<RoutingResponse> {
  console.log('Routing user message:', userMessage);
  console.log('Available chatbots:', chatbotsWithDescriptions.length);

  // List of available chatbots for system prompt
  const chatbotList = chatbotsWithDescriptions
    .map((bot) => `- ID: ${bot.id}\n  Name: ${bot.name}\n  Description: ${bot.description}`)
    .join('\n\n');

  const systemPrompt = `You are a routing assistant. Your ONLY job is to match user requests to the correct chatbot.

Available chatbots:
${chatbotList}

Instructions:
1. Focus PRIMARILY on the user's latest message.
2. Use previous history ONLY to understand context (e.g., if user says "change it", look back to see what "it" is).
3. IGNORE previous conversation topics if the user changes the subject.
4. If there's a reasonable match (even 70% confident), respond with ONLY the chatbot ID.

IMPORTANT: Users can potentially switch contexts often. If the user was talking about refunds but now asks for a blog post, 
immediately switch to appropriate chatbot if it exists. Otherwise ask clarifying message.

Response format:
- If matched: respond with ONLY the chatbot ID
- If truly unclear: ask a brief question (do NOT include chatbot IDs)`;

  const recentHistory = conversationHistory.slice(-3);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory,
    { role: 'user', content: userMessage },
  ];

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'kwaipilot/kat-coder-pro:free',
        messages: messages,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Chatbot Routing',
        },
      }
    );

    const routerResponse = response.data.choices[0].message.content.trim();
    console.log('Router response:', routerResponse);

    // Check if response is a valid chatbot ID
    const matchedChatbot = chatbotsWithDescriptions.find((bot) => bot.id === routerResponse);

    if (matchedChatbot) {
      console.log(`Routed to chatbot: ${matchedChatbot.name} (${matchedChatbot.id})`);
      return { chatbotId: matchedChatbot.id };
    }

    // Otherwise, it's a clarification message
    console.log('Need clarification, sending question to user');
    return {
      chatbotId: CLARIFICATION_BOT_ID,
      clarificationMessage: routerResponse,
    };
  } catch (error) {
    console.error('Routing error:', error);
    return {
      chatbotId: CLARIFICATION_BOT_ID,
      clarificationMessage: fallbackClarificationMessage(chatbotsWithDescriptions),
    };
  }
}

// Fallback clarification message in case of errors
function fallbackClarificationMessage(chatbots: ChatbotWithDescription[]): string {
  const botList = chatbots.map((bot) => `**${bot.name}**: ${bot.description}`).join('\n');

  return `Could you clarify what help you need. Here are the available areas:\n\n${botList}\n\n Which area would you like assistance with?`;
}
