// import { getOpenAIKey } from '@/lib/db-user-settings';
import { redirect } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { ExternalLink, Plus, Download, Import } from 'lucide-react';
import { AssistantCard } from '@/app/components/assistant-card';
// import { db } from '@/lib/db';
// import { assistants, type Assistant } from '@/lib/schema';
// import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';

export default async function AssistantsPage() {
  const { userId } = await auth();
  const apiKey = await getOpenAIKey();

  if (!userId) {
    redirect('/sign-in');
  }

  if (!apiKey) {
    redirect('/settings');
  }

  // Get user's imported/created assistants from our database
  let userAssistants: Assistant[] = [];
  let error = null;

  try {
    userAssistants = await db
      .select()
      .from(assistants)
      .where(and(eq(assistants.userId, userId), eq(assistants.isActive, true)))
      .orderBy(assistants.createdAt);
  } catch (e: unknown) {
    if (e instanceof Error) {
      error = e.message;
    } else {
      error = 'Failed to fetch assistants.';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Assistants</h1>
          <p className="text-muted-foreground">
            Manage assistants imported from OpenAI or created directly in our platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/assistants/import" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Import from OpenAI
            </Link>
          </Button>
          <Button asChild>
            <Link href="/assistants/create-chatbot" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <ExternalLink className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && userAssistants.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Import className="h-5 w-5" />
              Get Started with Assistants
            </CardTitle>
            <CardDescription>
              You dont have any assistants yet. You can either import existing ones from OpenAI or create new ones
              directly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-dashed">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Import from OpenAI</CardTitle>
                  <CardDescription>
                    Import your existing OpenAI assistants with all their configurations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/assistants/import" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Import Assistants
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Create New</CardTitle>
                  <CardDescription>
                    Create a new assistant directly in our platform with LiteLLM integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/assistants/create" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Assistant
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center pt-4">
              <Button variant="outline" asChild>
                <a
                  href="https://platform.openai.com/assistants"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Manage in OpenAI Platform <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && userAssistants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Assistants ({userAssistants.length})</h2>
            <Button variant="outline" asChild>
              <a
                href="https://platform.openai.com/assistants"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                OpenAI Platform <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userAssistants.map((assistant) => (
              <AssistantCard key={assistant.id} assistant={assistant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}