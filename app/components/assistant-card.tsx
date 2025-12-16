'use client';

import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/card';

type AssistantLike = {
  id: string;
  name?: string | null;
  description?: string | null;
  model?: string | null;
  createdAt?: string | Date | null;
};

export function AssistantCard({ assistant }: { assistant: AssistantLike }) {
  const created = assistant.createdAt ? new Date(assistant.createdAt).toLocaleDateString() : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{assistant.name ?? 'Untitled Assistant'}</span>
          {assistant.model && <span className="text-xs font-medium text-muted-foreground">{assistant.model}</span>}
        </CardTitle>
        {assistant.description && <CardDescription className="line-clamp-2">{assistant.description}</CardDescription>}
      </CardHeader>

      <CardContent className="text-xs text-muted-foreground">
        {created && <div>Created: {created}</div>}
        {!assistant.description && <div>No description</div>}
      </CardContent>

      <CardFooter className="gap-2">
        <Button asChild size="sm">
          <Link href={`/chat?bot=${assistant.id}`}>Open Chat</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/assistant/${assistant.id}`}>Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
