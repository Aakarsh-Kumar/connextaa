import app from './app';
import logger from './utils/logger';
import { createServer } from 'http';
import { initSocket } from './sockets/socket';
import { startScheduler } from './cron/scheduler';

const PORT = process.env.PORT || 3000;

process.once('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1); // Exit because app may be in an inconsistent state
});

// Handle unhandled Promise rejections
process.once('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason });
  process.exit(1); // Exit so process manager can restart the app
});

// Initialize database connection and start server
async function startServer() {
  try {
    const server = createServer(app);
    const io = initSocket(server);

    // Start the server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);
      
    });
    // Start background cron tasks
    const stopScheduler = startScheduler();

    // Handle graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);

      stopScheduler();
      await io.close();
      // Close server
      server.close(async () => {
        try {
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.once('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
