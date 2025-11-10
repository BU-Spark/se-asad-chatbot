import { NextResponse } from 'next/server';
import { triggerContextSummarizationManually } from '@/lib/cron/context-summarization';

/**
 * POST /api/cron/trigger-summarization
 *
 * Manually triggers the context summarization job
 * Useful for testing without waiting for the scheduled cron
 */
export async function POST() {
  try {
    console.log('📡 API: Manual summarization trigger requested');

    // Run the summarization job
    await triggerContextSummarizationManually();

    return NextResponse.json({
      success: true,
      message: 'Context summarization job completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run summarization job',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/trigger-summarization
 *
 * Returns information about the cron job
 */
export async function GET() {
  return NextResponse.json({
    message: 'Context Summarization Cron Job',
    schedule: 'Every day at 2:00 AM',
    batch_size: 5,
    usage: 'Send a POST request to this endpoint to manually trigger the job',
  });
}
