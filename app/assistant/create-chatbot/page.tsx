'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { AssistantForm } from './AssistantForm';
import { AssistantSidebar } from './AssistantSidebar';
import { AssistantFormData, ExampleInstruction } from './types';
import { EXAMPLE_INSTRUCTIONS } from './constants';

export default function CreateAssistantPage() {
  const [formData, setFormData] = useState<AssistantFormData>({
    name: '',
    description: '',
    instructions: '',
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
      description: example.description,
      instructions: example.instructions,
    }));
  };

  const handleCreateChatbot = async () => {
    setIsCreating(true);
    try {
      await axios.post('/api/chatbots', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        personality: formData.instructions.trim(),
      });
      router.refresh();
      // goto manage assistants page after successful chatbot creation
      router.push('/assistant/manage');
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
    // Validate all required fields
    if (!formData.name.trim() || !formData.description.trim() || !formData.instructions.trim()) {
      alert('Please fill in all required fields');
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Create New Assistant</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Build a custom AI assistant with powerful capabilities and automatic analytics tracking
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium
                       text-neutral-100 transition hover:border-emerald-600 hover:text-emerald-400"
          >
            ← Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <AssistantForm
              formData={formData}
              isCreating={isCreating}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Sidebar - Takes up 1 column */}
          <div>
            <AssistantSidebar exampleInstructions={EXAMPLE_INSTRUCTIONS} onExampleClick={handleExampleClick} />
          </div>
        </div>
      </div>
    </main>
  );
}
