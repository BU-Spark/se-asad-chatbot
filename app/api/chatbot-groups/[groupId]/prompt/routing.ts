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

  const systemPrompt = `You are a helpful routing assistant for a customer service system. Your job is to determine which chatbot should handle the user's request.

    Available chatbots:
    ${chatbotList}

    Instructions:
    1. Analyze the user's message carefully
    2. If the request clearly matches one of the available chatbots, respond ONLY with the chatbot ID (e.g., "4f813dd6-79ee-4061-b1ef-9d3994d6120b")
    3. If the request is unclear or doesn't match any chatbot, ask a clarifying question to help the user specify what they need. You can reference the available chatbots in your question.

    IMPORTANT: 
    - If you can confidently match to a chatbot, respond with ONLY the ID, nothing else
    - If you need clarification, respond with a natural, helpful question (do NOT include any chatbot IDs in clarification messages)`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
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
