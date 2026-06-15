import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingPage';
import { PracticeFormPage } from '../pages/PracticeFormPage';
import { createTestContext } from '../helpers/testUtils';
import fs from 'fs';
import path from 'path';

const dataPath = path.resolve('tests/test-data/novice.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

test('Novice practice flow - data driven', async ({ browser }, testInfo) => {
  const ctx = await createTestContext(browser, testInfo, 'novice-practice');
  const { page, logger, closeAndAttach } = ctx;
  const landing = new LandingPage(page);
  const home = new PracticeFormPage(page);

  try {
    logger.info('Opening landing fixture');
    await landing.goto('file://' + path.resolve('tests/fixtures/landing.html'));
    logger.info('Clicking Novice');
    await landing.clickNovice();
    await home.switchToFrame();

    logger.info('Filling practice form from data');
    await home.selectLevel(data.level);
    await home.fillName(data.name);
    await home.fillEmail(data.email);
    await home.setSubscribe(true);
    await home.chooseExperience('pro');
    await home.selectCategory(data.category);
    await home.setStartDate(data.startDate);

    const uploadPath = path.resolve('tests/fixtures/upload.txt');
    if (!fs.existsSync(uploadPath)) fs.writeFileSync(uploadPath, 'upload contents');
    await home.uploadFile(uploadPath);

    await home.fillTextBox(data.text || '');
    await home.dragToTarget();
    await home.submit();

    const result = await home.getResultText();
    logger.info(`Result: ${result}`);
    expect(result).toContain(data.level);
  } finally {
    await closeAndAttach();
  }
});
