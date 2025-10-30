import { ExampleInstruction, ModelOption } from './types';

// Can add more models here for selection
export const MODEL_OPTIONS: ModelOption[] = [{ value: 'gpt-5', label: 'GPT-5 (Most Capable)' }];

export const EXAMPLE_INSTRUCTIONS: ExampleInstruction[] = [
  {
    title: 'Customer Support Assistant',
    instructions:
      'You are a helpful customer support assistant. Always be polite, empathetic, and solution-focused. Ask clarifying questions when needed and provide step-by-step guidance to resolve customer issues.',
  },
  {
    title: 'Technical Documentation Helper',
    instructions:
      'You are a technical documentation assistant. Help users understand complex technical concepts by breaking them down into simple, clear explanations. Use examples and analogies when helpful.',
  },
  {
    title: 'Content Creator Assistant',
    instructions:
      'You are a creative content assistant. Help users brainstorm ideas, improve their writing, and create engaging content. Be encouraging and provide constructive feedback.',
  },
];
