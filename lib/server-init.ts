/**
 * Server Initialization
 *
 * This file is imported in layout.tsx or middleware to start
 * background jobs when the server starts.
 */

import { startContextSummarizationJob } from './cron/context-summarization';

let cronJobsInitialized = false;

/**
 * Initialize all background jobs
 * Should be called once when the server starts
 */
export function initializeBackgroundJobs() {
  // Prevent multiple initializations
  if (cronJobsInitialized) {
    console.log('  Background jobs already initialized, skipping...');
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log(' Initializing Background Jobs...');
  console.log('='.repeat(60) + '\n');

  try {
    // Start context summarization cron job
    startContextSummarizationJob();
    cronJobsInitialized = true;

    console.log('='.repeat(60));
    console.log(' All background jobs initialized successfully');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error(' Error initializing background jobs:', error);
  }
}

// Auto-initialize in development/production
// (only runs on server-side)
if (typeof window === 'undefined') {
  initializeBackgroundJobs();
}
