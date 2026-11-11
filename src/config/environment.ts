import { z } from 'zod';
import { APP_CONSTANTS } from './constants.js';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
  MONGO_URI: z.string().url().default(APP_CONSTANTS.MONGODB_DEFAULT_URI),
  GOOGLE_SHEETS_CREDS_JSON: z.string().optional(),   // справочник ресторанов из Google Sheets — в этой версии не подключён
  GOOGLE_SHEETS_ID: z.string().optional(),
  ADMIN_TELEGRAM_ID: z.string().regex(/^\d+$/).transform(Number),
  TARGET_CHAT_ID: z.string().regex(/^-?\d+$/).transform(Number),   // у групп и супергрупп id отрицательный
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default(APP_CONSTANTS.DEFAULT_LOG_LEVEL),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
