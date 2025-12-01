import { getEmbedding, getIntentEmbedding, cosineSimilarity } from './embeddings';
import { ChatbotWithDescription, CLARIFICATION_BOT_ID, CONFIDENCE_THRESHOLD } from './types';

export async function routeToChatbot(
  userMessage: string,
  chatbotsWithDescriptions: ChatbotWithDescription[]
): Promise<{ chatbotId: string; confidence: number }> {
  console.log('Available chatbots:', chatbotsWithDescriptions.length);
  console.log('User message:', userMessage);

  const messageEmbedding = await getEmbedding(userMessage);

  let bestChatbotId = chatbotsWithDescriptions[0]?.id || CLARIFICATION_BOT_ID;
  let bestScore = -1;

  // Compare message with each chatbot's description
  for (const chatbot of chatbotsWithDescriptions) {
    console.log(`Checking chatbot: ${chatbot.name} (${chatbot.id})`);

    if (!chatbot.description || chatbot.description.trim() === '') {
      console.log(`No description, skipping`);
      continue;
    }

    // Get embedding for the chatbot's description
    const descriptionEmbedding = await getIntentEmbedding(chatbot.description);
    const similarity = cosineSimilarity(messageEmbedding, descriptionEmbedding);

    console.log(`Description similarity: ${similarity.toFixed(3)}`);

    if (similarity > bestScore) {
      bestScore = similarity;
      bestChatbotId = chatbot.id;
    }
  }

  console.log(`Best match: ${bestChatbotId} with confidence ${bestScore.toFixed(3)}`);

  // Confidence too low, triggers clarification bot
  if (bestScore < CONFIDENCE_THRESHOLD) {
    console.log(`Confidence below threshold (${CONFIDENCE_THRESHOLD}), using clarification bot`);
    return { chatbotId: CLARIFICATION_BOT_ID, confidence: bestScore };
  }

  return { chatbotId: bestChatbotId, confidence: bestScore };
}

// Clarification message listing chatbot and their descriptions
export function generateClarificationMessage(chatbots: ChatbotWithDescription[]): string {
  const botList = chatbots.map((bot) => `**${bot.name}**: ${bot.description}`).join('\n');

  return `I'm not quite sure what you need help with. Could you please clarify? Here are the areas I can assist with:\n\n${botList}\n\n Let me know which one you'd like help with, or describe your request in more detail.`;
}
