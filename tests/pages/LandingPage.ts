import { Page } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly noviceBtn = '#novice';
  readonly intermediateBtn = '#intermediate';
  readonly expertBtn = '#expert';
  readonly launchUrlSelector = '#launchUrl';

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  getLaunchUrl() {
    return this.page.getAttribute(this.launchUrlSelector, 'data-url');
  }

  async clickNovice() {
    await this.page.click(this.noviceBtn);
  }

  async clickIntermediate() {
    await this.page.click(this.intermediateBtn);
  }

  async clickExpert() {
    await this.page.click(this.expertBtn);
  }
}
