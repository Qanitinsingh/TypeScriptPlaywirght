import { Page, Frame } from '@playwright/test';

export class PracticeFormPage {
  readonly page: Page;
  readonly frameSelector = '#practice-frame';
  frame?: Frame;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async switchToFrame() {
    const frameElement = await this.page.waitForSelector(this.frameSelector);
  const cf = await frameElement.contentFrame();
  if (!cf) throw new Error('Frame not available');
  this.frame = cf;
  }

  async selectLevel(level: string) {
    if (!this.frame) throw new Error('Frame not initialized');
    await this.frame.selectOption('#level', level);
  }

  async fillName(name: string) {
    if (!this.frame) throw new Error('Frame not initialized');
    await this.frame.fill('#name', name);
  }

  async fillEmail(email: string) {
    if (!this.frame) throw new Error('Frame not initialized');
    await this.frame.fill('#email', email);
  }

  async setSubscribe(value: boolean) {
    if (!this.frame) throw new Error('Frame not initialized');
    const checked = await this.frame.isChecked('#subscribe');
    if (checked !== value) await this.frame.click('#subscribe');
  }

  async chooseExperience(value: string) {
    if (!this.frame) throw new Error('Frame not initialized');
    await this.frame.check(`input[name="exp"][value="${value}"]`);
  }

  async selectCategory(value: string) {
    if (!this.frame) throw new Error('Frame not initialized');
    await this.frame.selectOption('#category', value);
  }

  async setStartDate(value: string) {
    if (!this.frame) throw new Error('Frame not initialized');
    await this.frame.fill('#start', value);
  }

  async uploadFile(filePath: string) {
    if (!this.frame) throw new Error('Frame not initialized');
    const input = await this.frame.$('#file');
    if (!input) throw new Error('file input not found');
    await input.setInputFiles(filePath);
  }

  async dragToTarget() {
    if (!this.frame) throw new Error('Frame not initialized');
    const src = await this.frame.$('#drag-source');
    const tgt = await this.frame.$('#drop-target');
    if (!src || !tgt) throw new Error('drag elements not found');
    const srcBox = await src.boundingBox();
    const tgtBox = await tgt.boundingBox();
    if (!srcBox || !tgtBox) throw new Error('could not determine bounding boxes');
    // boundingBox on frame is relative to the frame viewport; get frame's parent element offset
    const frameElement = await this.page.$(this.frameSelector);
    const frameBox = frameElement ? await frameElement.boundingBox() : null;
    if (!frameBox) throw new Error('frame box not found');
    const startX = frameBox.x + srcBox.x + srcBox.width / 2;
    const startY = frameBox.y + srcBox.y + srcBox.height / 2;
    const endX = frameBox.x + tgtBox.x + tgtBox.width / 2;
    const endY = frameBox.y + tgtBox.y + tgtBox.height / 2;
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY);
    await this.page.mouse.up();
  }

  async fillTextBox(text: string) {
    if (!this.frame) throw new Error('Frame not initialized');
    await this.frame.fill('#textbox', text);
  }

  async submit() {
    if (!this.frame) throw new Error('Frame not initialized');
    await this.frame.click('#submit');
  }

  async getResultText() {
    if (!this.frame) throw new Error('Frame not initialized');
    return await this.frame.textContent('#result');
  }
}
