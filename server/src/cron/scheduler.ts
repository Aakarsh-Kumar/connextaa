import { autoCompleteOldCollaborations, cleanupExpiredChats } from './cleanupCompletedChats';
import logger from '../utils/logger';

// Runs hourly: 60 minutes * 60 seconds * 1000 milliseconds = 3,600,000 ms
const ONE_HOUR = 3600000;

export function startScheduler() {
  logger.info('Starting cron scheduler...');
  
  // Run immediately on startup
  runTasks();

  // Schedule to run every hour
  const intervalId = setInterval(runTasks, ONE_HOUR);

  // Return function to stop it if needed
  return () => {
    clearInterval(intervalId);
    logger.info('Cron scheduler stopped.');
  };
}

let isRunning = false;

async function runTasks() {
  if (isRunning) {
    logger.warn("Previous cron execution is still running. Skipping.");
    return;
  }

  isRunning = true;

  try {
  logger.info("Running scheduled maintenance jobs", {
    timestamp: new Date().toISOString(),
  });

    try {
        await autoCompleteOldCollaborations();
    } catch (error) {
        logger.error("Auto-complete cron failed", { error });
    }

    try {
        await cleanupExpiredChats();
    } catch (error) {
        logger.error("Cleanup cron failed", { error });
    }

    logger.info("Scheduled cron tasks completed.");
  } catch (error) {
    logger.error("Error during scheduled cron task execution", { error });
  } finally {
    isRunning = false;
  }
}