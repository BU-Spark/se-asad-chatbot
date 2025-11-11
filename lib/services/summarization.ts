import { Message } from '../types/conversation';

/**
 * Summarizes a batch of messages into a concise summary using OpenRouter.
 *
 * @param messages - Array of messages to summarize
 * @returns A summary string
 */
export async function summarizeMessages(messages: Message[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Add it to your environment (e.g., .env.local) and restart the server.'
    );
  }

  // Build a compact transcript
  const transcript = messages
    .map((m) => {
      const snippet = m.content.length > 600 ? m.content.slice(0, 600) + '…' : m.content;
      return `${m.role}: ${snippet}`;
    })
    .join('\n');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.YOUR_SITE_URL || 'http://localhost:3000', // Optional but recommended
      'X-Title': process.env.YOUR_SITE_NAME || 'My App', // Optional but recommended
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini', // Good budget option, or use 'anthropic/claude-3-haiku' for even cheaper
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that summarizes conversations concisely. Provide a 1–2 sentence summary of the key topics and outcomes.',
        },
        {
          role: 'user',
          content: `Please summarize the following conversation:\n\n${transcript}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 120,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const summary = data?.choices?.[0]?.message?.content?.trim();

  if (!summary) {
    throw new Error('OpenRouter returned no summary content.');
  }

  return summary;
}
