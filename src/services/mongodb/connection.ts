import mongoose from 'mongoose';
import { env } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

let isConnected = false;

/**
 * Подключение к MongoDB
 */
export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    logger.info('MongoDB is already connected');
    return;
  }

  try {
    await mongoose.connect(env.MONGO_URI);
    isConnected = true;
    logger.info('✅ MongoDB Connected Successfully', {
      uri: env.MONGO_URI.replace(/\/\/.*@/, '//***:***@'),
    });

    // Настройка graceful shutdown
    setupGracefulShutdown();
  } catch (error) {
    logger.error('❌ MongoDB Connection Failed', { error });
    process.exit(1);
  }
};

/**
 * Корректное закрытие соединения при выключении сервера
 */
const setupGracefulShutdown = (): void => {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Closing MongoDB connection...`);
    try {
      await mongoose.disconnect();
      logger.info('MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during MongoDB disconnect', { error });
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};
