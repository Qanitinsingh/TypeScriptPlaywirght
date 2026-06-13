import { Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly noviceSelector = '#novice';
  readonly intermediateSelector = '#intermediate';
  readonly expertSelector = '#expert';

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async clickNovice() {
    await this.page.click(this.noviceSelector);
  }

  async clickIntermediate() {
    await this.page.click(this.intermediateSelector);
  }

  async clickExpert() {
    await this.page.click(this.expertSelector);
  }
}
