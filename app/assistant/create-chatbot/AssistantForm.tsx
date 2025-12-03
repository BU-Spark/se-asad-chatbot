'use client';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Loader2, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AssistantFormData, ModelOption } from './types';

interface AssistantFormProps {
  formData: AssistantFormData;
  modelOptions: ModelOption[];
  isCreating: boolean;
  onInputChange: (field: keyof AssistantFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AssistantForm({ formData, modelOptions, isCreating, onInputChange, onSubmit }: AssistantFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Assistant Configuration
        </CardTitle>
        <CardDescription>Define your assistant&apos;s personality, capabilities, and behavior</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Assistant Name *</Label>
              <Input
                id="name"
                placeholder="Customer Support Bot"
                value={formData.name}
                onChange={(e) => onInputChange('name', e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => onInputChange('model', value)}
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
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Brief description of what this assistant does"
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions *</Label>
            <Textarea
              id="instructions"
              placeholder="Detailed instructions for how the assistant should behave..."
              value={formData.instructions}
              onChange={(e) => onInputChange('instructions', e.target.value)}
              disabled={isCreating}
              rows={8}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Be specific about the assistant&apos;s role, tone, and how it should respond.
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
  );
}
