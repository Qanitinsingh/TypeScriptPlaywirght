import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.resolve('logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

export function createLogger(prefix: string) {
  const now = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(logsDir, `${prefix}-${now}.log`);
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [new winston.transports.File({ filename: logFile })],
  });
  return { logger, logFile };
}
