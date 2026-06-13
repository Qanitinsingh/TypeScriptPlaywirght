import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logsDir = path.resolve('logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
const now = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(logsDir, `test-${now}.log`);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [new winston.transports.File({ filename: logFile })],
});

test.describe.serial('Homepage flows in single browser session', () => {
  let page: any;
  let home: HomePage;
  let context: any;

  test.beforeAll(async ({ browser }) => {
    logger.info('Launching single browser session');
    context = await browser.newContext();
    page = await context.newPage();
    home = new HomePage(page);
    // navigate to local fixture
    const path = require('path');
    const fixture = 'tests/fixtures/home.html';
    const url = 'file://' + path.resolve(fixture);
    await home.goto(url);
  });

  test.afterAll(async () => {
    logger.info('Closing browser session');
    await context.close();
  });

  test('run1 - launch URL and click Novice', async () => {
    //test.info().annotations.push({ type: 'severity', description: 'minor' });
    logger.info('Clicking Novice');
    await home.clickNovice();
    // lightweight check (adapt to real app)
    //expect(true).toBeTruthy();
  });

  test('run2 - click Intermediate', async () => {
    logger.info('Clicking Intermediate');
    await home.clickIntermediate();
    expect(true).toBeTruthy();
  });

  test('run3 - click Expert', async () => {
    logger.info('Clicking Expert');
    await home.clickExpert();
    expect(true).toBeTruthy();
  });
});
