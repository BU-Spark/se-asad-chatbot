import cron from 'node-cron';
import { getConversationsNeedingSummarization, updateConversationSummaries } from '../db/conversation-queries';
import { summarizeMessages } from '../services/summarization';
import { Conversation, Summary, SummariesData } from '../types/conversation';

/**
 * Configuration for the context summarization job
 */
const CONFIG = {
  BATCH_SIZE: 5, // Number of messages to summarize at once
  CRON_SCHEDULE: '0 2 * * *', // Every day at 2:00 AM
};

/**
 * Processes a single conversation and generates summaries for new messages
 */
async function processConversation(conversation: Conversation): Promise<void> {
  try {
    console.log(`\n Processing conversation ${conversation.id}...`);

    if (!conversation.messages || conversation.messages.length === 0) {
      console.log('  No messages found, skipping');
      return;
    }

    const totalMessages = conversation.messages.length;
    const lastProcessedIndex = conversation.summaries?.last_processed_index ?? 0;
    const newMessagesCount = totalMessages - lastProcessedIndex;

    console.log(`  Total messages: ${totalMessages}`);
    console.log(`  Last processed index: ${lastProcessedIndex}`);
    console.log(`  New messages: ${newMessagesCount}`);

    // Only process if we have at least BATCH_SIZE new messages
    if (newMessagesCount < CONFIG.BATCH_SIZE) {
      console.log(`   Not enough new messages (need ${CONFIG.BATCH_SIZE})`);
      return;
    }

    // Extract the new messages starting from last processed index
    const messagesToSummarize = conversation.messages.slice(lastProcessedIndex, lastProcessedIndex + CONFIG.BATCH_SIZE);

    console.log(`  Summarizing messages ${lastProcessedIndex}-${lastProcessedIndex + CONFIG.BATCH_SIZE - 1}...`);

    // Generate summary
    const summaryText = await summarizeMessages(messagesToSummarize);

    // Create new summary object
    const newSummary: Summary = {
      message_range: `${lastProcessedIndex}-${lastProcessedIndex + CONFIG.BATCH_SIZE - 1}`,
      summary: summaryText,
      created_at: new Date().toISOString(),
    };

    // Update summaries data
    const existingSummaries = conversation.summaries?.summaries ?? [];
    const updatedSummariesData: SummariesData = {
      last_processed_index: lastProcessedIndex + CONFIG.BATCH_SIZE,
      summaries: [...existingSummaries, newSummary],
    };

    // Save to database
    await updateConversationSummaries(conversation.id, updatedSummariesData);

    console.log(`  Successfully summarized and saved`);
  } catch (error) {
    console.error(` Error processing conversation ${conversation.id}:`, error);
    // Continue with other conversations even if one fails
  }
}

/**
 * Main function that runs the summarization job
 */
async function runContextSummarizationJob(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log(' Starting Context Summarization Job');
  console.log('   Time:', new Date().toISOString());
  console.log('='.repeat(60));

  try {
    // Fetch conversations that need summarization
    const conversations = await getConversationsNeedingSummarization(CONFIG.BATCH_SIZE);

    console.log(`\n📊 Found ${conversations.length} conversations needing summarization\n`);

    if (conversations.length === 0) {
      console.log(' All conversations are up to date!');
      return;
    }

    // Process each conversation
    for (const conversation of conversations) {
      await processConversation(conversation);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Context Summarization Job Complete');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('Fatal error in summarization job:', error);
  }
}

/**
 * Starts the cron job for context summarization
 * Should be called when the server starts
 */
export function startContextSummarizationJob(): void {
  console.log('\n Scheduling context summarization cron job...');
  console.log(`   Schedule: ${CONFIG.CRON_SCHEDULE} (Every day at 2:00 AM)`);
  console.log(`   Batch size: ${CONFIG.BATCH_SIZE} messages\n`);

  // Schedule the cron job
  cron.schedule(CONFIG.CRON_SCHEDULE, async () => {
    await runContextSummarizationJob();
  });

  console.log(' Cron job scheduled successfully!\n');
}

/**
 * Manually trigger the summarization job (for testing)
 * Can be called via API endpoint or CLI
 */
export async function triggerContextSummarizationManually(): Promise<void> {
  console.log('\n🔧 Manually triggering context summarization...\n');
  await runContextSummarizationJob();
}
