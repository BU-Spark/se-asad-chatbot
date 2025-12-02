import { NextRequest, NextResponse } from 'next/server';
import { validateChatbotGroup } from '@/lib/validation';

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');

  if (!origin) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(req: NextRequest, context: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await context.params;
  const origin = req.headers.get('origin');

  const createResponse = (body: unknown, status: number) => {
    return new NextResponse(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '',
      },
    });
  };

  if (!groupId) {
    return createResponse({ error: 'Group ID is required' }, 400);
  }

  const validation = await validateChatbotGroup(groupId);
  if (!validation.success) {
    return createResponse({ error: validation.error }, validation.status!);
  }

  return createResponse({ valid: true }, 200);
}
