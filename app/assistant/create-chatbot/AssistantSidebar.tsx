'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ExampleInstruction } from './types';

interface AssistantSidebarProps {
  exampleInstructions: ExampleInstruction[];
  onExampleClick: (example: ExampleInstruction) => void;
}

export function AssistantSidebar({ exampleInstructions, onExampleClick }: AssistantSidebarProps) {
  return (
    <div className="w-full lg:flex-1 max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">✨ What You Get </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
            <div>
              <strong>LiteLLM Integration</strong>
              <p className="text-muted-foreground">Direct integration with OpenRouter proxy for enhanced features</p>
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
              onClick={() => onExampleClick(example)}
            >
              <div className="font-medium text-sm mb-1">{example.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-3">{example.instructions}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
