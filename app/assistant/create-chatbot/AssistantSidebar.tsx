'use client';

import { ExampleInstruction } from './types';
import { Lightbulb } from 'lucide-react';

interface AssistantSidebarProps {
  exampleInstructions: ExampleInstruction[];
  onExampleClick: (example: ExampleInstruction) => void;
}

export function AssistantSidebar({ exampleInstructions, onExampleClick }: AssistantSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Example Instructions Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          <h3 className="text-lg font-semibold">Example Templates</h3>
        </div>
        <p className="mb-4 text-xs text-neutral-400">
          Click any template to auto-fill the form with a pre-configured assistant
        </p>
        <div className="space-y-3">
          {exampleInstructions.map((example, index) => (
            <button
              key={index}
              onClick={() => onExampleClick(example)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 p-4 text-left transition hover:border-emerald-600 hover:bg-neutral-800"
            >
              <div className="mb-1 font-medium text-sm text-neutral-100">{example.title}</div>
              <div className="text-xs text-neutral-400 line-clamp-2">{example.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
