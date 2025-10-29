'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import type { Assistant as OpenAIAssistant } from '@/lib/openai-validation';
import type { Assistant as DBAssistant } from '@/lib/schema';

// Union type to handle both OpenAI and database assistants
type AssistantData = OpenAIAssistant | DBAssistant;

interface AssistantCardProps {
  assistant: AssistantData;
  isSelected?: boolean;
  onSelect?: () => void;
  showSelectIndicator?: boolean;
}

// Helper function to get tools count safely
function getToolsCount(assistant: AssistantData): number {
  if (!assistant.tools) return 0;

  // Handle array of tools
  if (Array.isArray(assistant.tools)) {
    return assistant.tools.length;
  }

  // Handle other formats (could be an object or empty)
  return 0;
}

// Helper function to safely format the creation date
function formatCreationDate(assistant: AssistantData): string {
  try {
    let date: Date;

    // Check if it's an OpenAI assistant (has created_at as number)
    if ('created_at' in assistant && typeof assistant.created_at === 'number') {
      date = new Date(assistant.created_at * 1000);
    }
    // Check if it's a database assistant (has createdAt as Date/string)
    else if ('createdAt' in assistant && assistant.createdAt) {
      date = new Date(assistant.createdAt);
    }
    // Fallback to current date if neither format is available
    else {
      return 'Unknown';
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown';
  }
}

// Helper function to get the assistant ID for OpenAI platform link
function getOpenAIAssistantId(assistant: AssistantData): string {
  if ('openaiAssistantId' in assistant && assistant.openaiAssistantId) {
    return assistant.openaiAssistantId;
  }
  return assistant.id;
}

export function AssistantCard({
  assistant,
  isSelected = false,
  onSelect,
  showSelectIndicator = false,
}: AssistantCardProps) {
  return (
    <Card
      key={assistant.id}
      className={`flex flex-col transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="truncate">{assistant.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{assistant.model}</Badge>
              {getToolsCount(assistant) > 0 && (
                <Badge variant="outline">
                  {getToolsCount(assistant)} tool{getToolsCount(assistant) !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardDescription>
          </div>
          {showSelectIndicator && isSelected && <div className="h-4 w-4 rounded-full bg-primary"></div>}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm line-clamp-3">
          {assistant.description || assistant.instructions.substring(0, 120) + '...'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground">Created {formatCreationDate(assistant)}</div>
        <Button variant="ghost" size="sm" asChild className="text-xs" onClick={(e) => e.stopPropagation()}>
          <a
            href={`https://platform.openai.com/assistants/${getOpenAIAssistantId(assistant)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            View <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
