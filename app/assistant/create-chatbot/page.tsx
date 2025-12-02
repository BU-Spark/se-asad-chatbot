'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

import { AssistantForm } from './AssistantForm';
import { AssistantSidebar } from './AssistantSidebar';
import { AssistantFormData, ExampleInstruction } from './types';
import { MODEL_OPTIONS, EXAMPLE_INSTRUCTIONS } from './constants';

export default function CreateAssistantPage() {
  const [formData, setFormData] = useState<AssistantFormData>({
    name: '',
    description: '',
    instructions: '',
    model: 'gpt-5',
  });
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: keyof AssistantFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExampleClick = (example: ExampleInstruction) => {
    setFormData((prev) => ({
      ...prev,
      name: example.title,
      instructions: example.instructions,
    }));
  };

  const handleCreateChatbot = async () => {
    setIsCreating(true);
    try {
      const res = await axios.post('/api/chatbots', {
        name: formData.name.trim(),
        personality: formData.instructions.trim(),
      });
      const { id } = res.data as { id: string };
      router.push(`/?created=${encodeURIComponent(id)}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        const returnTo = encodeURIComponent('/assistant/create-chatbot');
        router.push(`/sign-in?redirect_url=${returnTo}`);
      } else {
        alert(
          (axios.isAxiosError(err) && err.response?.data?.error) ||
            (err as Error).message ||
            'Failed to create assistant'
        );
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.instructions.trim()) {
      console.error('Validation Error: Name and instructions are required');
      return;
    }
    await handleCreateChatbot();
  };

  return (
    <main className="relative min-h-[calc(100vh-56px)] bg-neutral-950 text-neutral-100">
      {/* Subtle radial backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium
                       text-neutral-100 transition hover:border-emerald-600 hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Create New Assistant</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Create a custom AI assistant with OpenRouter integration and automatic analytics tracking
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1">
            <AssistantForm
              formData={formData}
              modelOptions={MODEL_OPTIONS}
              isCreating={isCreating}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>

          <AssistantSidebar exampleInstructions={EXAMPLE_INSTRUCTIONS} onExampleClick={handleExampleClick} />
        </div>
      </div>
    </main>
  );
}
