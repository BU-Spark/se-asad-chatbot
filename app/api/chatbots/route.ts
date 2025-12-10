export const runtime = 'nodejs';

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabase_admin } from '../../../lib/supabase_admin';

interface ChatbotData {
  id: string;
  name: string;
  created_at: string;
}

export async function getUserIdOrDev() {
  const { userId } = await auth();
  return userId ?? process.env.DEV_CLERK_ID ?? null;
}

export async function GET() {
  try {
    const userId = await getUserIdOrDev();
    if (!userId) return NextResponse.json<ChatbotData[]>([], { status: 200 });

    const { data, error } = await supabase_admin
      .from('Chatbot')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? [], { status: 200 });
  } catch (error: unknown) {
    console.error('Chatbot API error', error);
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const uid = userId; // your Clerk user ID

    if (!uid) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, personality } = body;

    if (!name || !description || !personality) {
      return NextResponse.json(
        {
          error: 'Missing fields. Name, Description, and Personality are required.',
        },
        { status: 400 }
      );
    }

    // Create chatbot
    const { data, error } = await supabase_admin
      .from('Chatbot')
      .insert({
        name: name,
        description: description,
        personality: personality,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Chatbot creation error:', error);
      return NextResponse.json({ error: 'Failed to create chatbot' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    console.error('Chatbot API error', error);
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
