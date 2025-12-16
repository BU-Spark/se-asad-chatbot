import { OpenRouterClient, MemoryHistoryStorage } from 'openrouter-kit';

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY missing');
}

export const openrouter = new OpenRouterClient({
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: 'openai/gpt-4o-mini',
  debug: false,

  // --- Cost Tracking ---
  enableCostTracking: true,
  priceRefreshIntervalMs: 1000 * 60 * 60 * 6, // refresh every 6h

  // --- History (optional but good for context retention) ---
  historyAdapter: new MemoryHistoryStorage(),
  historyTtl: 1000 * 60 * 60 * 24, // 1 day

  // --- Security Config ---
  security: {
    authentication: {
      type: 'api-key',
      header: 'x-openrouter-key',
      required: true,
    },
    rateLimit: {
      enabled: true,
      limit: 100, // 100 requests
      windowMs: 60 * 1000, // per minute
    },
    acl: {
      roles: {
        user: { allow: ['chat'] },
        admin: { allow: ['chat', 'tools'] },
      },
    },
  },

  // --- Routing and fallbacks ---
  modelFallbacks: ['openai/gpt-4o', 'mistralai/mistral-medium', 'anthropic/claude-3-haiku'],

  // --- Reasoning support (opt-in per request, but ready) ---
  reasoning: {
    effort: 'medium',
    max_tokens: 256,
    exclude: false,
  },
});
