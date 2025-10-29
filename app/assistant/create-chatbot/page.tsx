'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useToast } from '@/app/hooks/use-toast';
import { Loader2, ArrowLeft, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AssistantFormData {
  name: string;
  description: string;
  instructions: string;
  model: string;
}

export default function CreateAssistantPage() {
  const [formData, setFormData] = useState<AssistantFormData>({
    name: '',
    description: '',
    instructions: '',
    model: 'gpt-3.5-turbo',
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (field: keyof AssistantFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.instructions.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and instructions are required',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/assistants/litellm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assistant');
      }

      const assistant = await response.json();

      toast({
        title: 'Success! 🎉',
        description: `Assistant "${assistant.name}" created successfully with virtual key for analytics tracking`,
      });

      router.push('/assistants');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create assistant',
          variant: 'destructive',
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const modelOptions = [
    { value: 'gpt-4', label: 'GPT-4 (Most Capable)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Balanced)' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast & Cost-effective)' },
  ];

  const exampleInstructions = [
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

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 max-w-6xl mx-auto p-6">
      {/* Main Form */}
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
              Create a custom AI assistant with LiteLLM integration and automatic analytics tracking
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Assistant Configuration
            </CardTitle>
            <CardDescription>Define your assistants personality, capabilities, and behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Assistant Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Customer Support Bot"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isCreating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={formData.model}
                    onValueChange={(value) => handleInputChange('model', value)}
                    disabled={isCreating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of what this assistant does"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions *</Label>
                <Textarea
                  id="instructions"
                  placeholder="Detailed instructions for how the assistant should behave..."
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  disabled={isCreating}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Be specific about the assistants role, tone, and how it should respond to different situations.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isCreating || !formData.name.trim() || !formData.instructions.trim()}
                  className="flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Assistant...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Create Assistant
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/assistants">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:flex-1 max-w-md space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">✨ What You Get</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
              <div>
                <strong>LiteLLM Integration</strong>
                <p className="text-muted-foreground">Direct integration with LiteLLM proxy for enhanced features</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
              <div>
                <strong>Analytics Tracking</strong>
                <p className="text-muted-foreground">Automatic cost and usage tracking with dedicated virtual key</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
              <div>
                <strong>Widget Ready</strong>
                <p className="text-muted-foreground">Ready to embed in groups and use with chat widgets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 Example Instructions</CardTitle>
            <CardDescription>Click any example to use it as a starting point</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {exampleInstructions.map((example, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  handleInputChange('instructions', example.instructions);
                  if (!formData.name) {
                    handleInputChange('name', example.title);
                  }
                }}
              >
                <div className="font-medium text-sm mb-1">{example.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-3">{example.instructions}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
