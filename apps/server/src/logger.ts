import pino from 'pino';

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  ...(nodeEnv === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
        },
      }
    : {}),
});
