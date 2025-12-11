'use client';

import { Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AssistantFormData } from './types';

interface AssistantFormProps {
  formData: AssistantFormData;
  isCreating: boolean;
  onInputChange: (field: keyof AssistantFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AssistantForm({ formData, isCreating, onInputChange, onSubmit }: AssistantFormProps) {
  const isValid = formData.name.trim() && formData.description.trim() && formData.instructions.trim();

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-neutral-200">
            Assistant Name <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g., Customer Support Bot"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            disabled={isCreating}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-neutral-200">
            Description <span className="text-red-400">*</span>
          </label>
          <input
            id="description"
            type="text"
            placeholder="Brief description of what this assistant does"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            disabled={isCreating}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          />
          <p className="text-xs text-neutral-400">A short summary that helps you identify this assistant</p>
        </div>

        {/* Instructions Field */}
        <div className="space-y-2">
          <label htmlFor="instructions" className="text-sm font-medium text-neutral-200">
            Instructions <span className="text-red-400">*</span>
          </label>
          <textarea
            id="instructions"
            placeholder="Detailed instructions for how the assistant should behave..."
            value={formData.instructions}
            onChange={(e) => onInputChange('instructions', e.target.value)}
            disabled={isCreating}
            rows={10}
            className="w-full resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          />
          <p className="text-xs text-neutral-400">
            Be specific about the assistant&apos;s role, tone, and how it should respond to users
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isCreating || !isValid}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
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
          </button>
          <Link
            href="/"
            className="flex items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 px-6 py-2.5 text-sm font-medium text-neutral-100 transition hover:border-emerald-600 hover:text-emerald-400"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
