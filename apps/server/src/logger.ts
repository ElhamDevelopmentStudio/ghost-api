import pino from 'pino';
import { env } from './env.js';

const e = env();

export const logger = pino({
  level: e.LOG_LEVEL,
  ...(e.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
        },
      }
    : {}),
});
