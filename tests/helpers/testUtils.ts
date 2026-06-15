import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';

export type TestContext = {
  context: BrowserContext;
  page: Page;
  logger: winston.Logger;
  logFile: string;
  closeAndAttach: () => Promise<void>;
};

export async function createTestContext(browser: Browser, testInfo: TestInfo, prefix = 'test'): Promise<TestContext> {
  const logsDir = path.resolve('logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  const videosDir = path.resolve('videos');
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

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

  const context = await browser.newContext({ recordVideo: { dir: videosDir } as any });
  const page = await context.newPage();

  async function closeAndAttach() {
    try {
      await context.close();
    } catch (e) {
      // ignore close errors
    }

    if (fs.existsSync(logFile)) {
      await testInfo.attach(`${prefix}-log`, { path: logFile, contentType: 'text/plain' });
    }

    try {
      const files = fs.readdirSync(videosDir).map(f => ({ name: f, time: fs.statSync(path.join(videosDir, f)).mtime.getTime() }));
      files.sort((a, b) => b.time - a.time);
      if (files.length) {
        await testInfo.attach('video', { path: path.join(videosDir, files[0].name), contentType: 'video/webm' });
      }
    } catch (e) {
      // ignore attach errors
    }
  }

  return { context, page, logger, logFile, closeAndAttach };
}
