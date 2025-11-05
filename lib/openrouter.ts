import { OpenRouterClient } from 'openrouter-kit';

export const openrouter = new OpenRouterClient({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: 'openai/gpt-4o-mini',
  debug: false,
});
