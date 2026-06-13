import { test, expect, Browser } from '@playwright/test';
import { PracticeFormPage } from './pages/PracticeFormPage';
import fs from 'fs';
import path from 'path';
import winston from 'winston';

const logsDir = path.resolve('logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

test('Practice form - fill inside iframe (video & attachments)', async ({ browser }, testInfo) => {
  const now = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(logsDir, `practice-form-${now}.log`);
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [new winston.transports.File({ filename: logFile })],
  });

  // ensure videos dir
  const videosDir = path.resolve('videos');
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

  // create a video-enabled context for this test
  const context = await browser.newContext({ recordVideo: { dir: videosDir } as any });
  const page = await context.newPage();
  const home = new PracticeFormPage(page);

  // create upload fixture if missing
  const uploadPath = path.resolve('tests/fixtures/upload.txt');
  if (!fs.existsSync(uploadPath)) fs.writeFileSync(uploadPath, 'upload contents');

  let videoPath: string | undefined;

  try {
    logger.info('Opening practice form container');
    const fixture = 'tests/fixtures/practice-form.html';
    const url = 'file://' + path.resolve(fixture);
    await home.goto(url);
    await home.switchToFrame();

    logger.info('Selecting novice level');
    await home.selectLevel('novice');
    await home.fillName('Test User');
    await home.fillEmail('test@example.com');
    await home.setSubscribe(true);
    await home.chooseExperience('pro');
    await home.selectCategory('advanced');
    await home.setStartDate('2023-01-01');
    await home.uploadFile(uploadPath);
    await home.fillTextBox('Hello — testing text box');
    await home.dragToTarget();
    await home.submit();

    const result = await home.getResultText();
    logger.info(`Form result: ${result}`);
    expect(result).toContain('novice');

    // grab video path (Playwright writes video on context.close())
    const video = await page.video();
    if (video) {
      // path may be available after page.close/context.close; we get it after closing below
      // store reference to find later
      videoPath = (await video.path()) as string;
    }
  } catch (err) {
    logger.error(`Test error: ${err}`);
    throw err;
  } finally {
    // always close context to flush the video to disk
    await context.close();

    // attach logs to the test
    if (fs.existsSync(logFile)) {
      await testInfo.attach('test-log', { path: logFile, contentType: 'text/plain' });
    }

    // all videos for this context are placed under videosDir; find the most recent if videoPath missing
    if (!videoPath) {
      try {
        const files = fs.readdirSync(videosDir).map(f => ({
          name: f,
          time: fs.statSync(path.join(videosDir, f)).mtime.getTime(),
        }));
        files.sort((a, b) => b.time - a.time);
        if (files.length) videoPath = path.join(videosDir, files[0].name);
      } catch (e) {
        // ignore
      }
    }

    if (videoPath && fs.existsSync(videoPath)) {
      // attach video to the test result (Allure/Playwright will keep the attachment)
      await testInfo.attach('video', { path: videoPath, contentType: 'video/webm' });
    }
  }
});
