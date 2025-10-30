'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import type { AxiosError } from 'axios';

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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExampleClick = (example: ExampleInstruction) => {
    setFormData((prev) => ({
      ...prev,
      instructions: example.instructions,
      // Set new name unconditionally
      name: example.title,
    }));
  };

  const handleCreateChatbot = async () => {
    setIsCreating(true);

    try {
      await axios.post('/api/chatbots', {
        name: formData.name,
        personality: formData.instructions,
      });

      // Redirect to chatbot dashboard
      router.push('/chatbots');
    } catch (error: unknown) {
      let message = 'Failed to create chatbot';

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        message = axiosError.response?.data?.error || axiosError.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      console.error(message);
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
    <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 max-w-6xl mx-auto p-6">
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/assistants" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Assistants
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Assistant</h1>
            <p className="text-muted-foreground">
              Create a custom AI assistant with OpenRouter integration and automatic analytics tracking
            </p>
          </div>
        </div>

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
  );
}
