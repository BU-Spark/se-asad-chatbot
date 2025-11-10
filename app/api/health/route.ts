import { NextResponse } from 'next/server';

// This import will initialize the cron jobs when the API route is first loaded
import '@/lib/server-init';

/**
 * GET /api/health
 *
 * Health check endpoint that also ensures server initialization
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      contextSummarization: 'active',
    },
  });
}
