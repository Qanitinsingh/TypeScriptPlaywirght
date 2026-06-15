import { test, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingPage';
import { PracticeFormPage } from '../pages/PracticeFormPage';
import { createTestContext } from '../helpers/testUtils';
import fs from 'fs';
import path from 'path';

const dataPath = path.resolve('tests/test-data/intermediate.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

test('Intermediate practice - first option', async ({ browser }, testInfo) => {
  const ctx = await createTestContext(browser, testInfo, 'intermediate-practice');
  const { page, logger, closeAndAttach } = ctx;
  const landing = new LandingPage(page);
  const home = new PracticeFormPage(page);

  try {
    await landing.goto('file://' + path.resolve('tests/fixtures/landing.html'));
    await landing.clickIntermediate();
    await home.switchToFrame();
    await home.selectLevel(data.level);
    await home.submit();
    const result = await home.getResultText();
    logger.info(`Result: ${result}`);
    expect(result).toContain(data.level);
  } finally {
    await closeAndAttach();
  }
});
