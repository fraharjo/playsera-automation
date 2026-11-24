import { Page, Locator, expect } from '@playwright/test';

/**
 * Playsera Base Page Object
 * Provides robust helpers, Smart Contract Locators (data-testid / name / id fallback),
 * and multi-language / i18n element resolution for Playwright.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a path relative to baseURL
   */
  async goto(path = ''): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for network idle or dom content loaded
   */
  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Smart Contract Locator for Shift-Left & Unfinished Features:
   * Maps to [data-testid="id"], [name="id"], or #id.
   * Enables early test design before final developer locators are completed.
   */
  contract(elementId: string): Locator {
    return this.page.locator(`[data-testid="${elementId}"], [name="${elementId}"], #${elementId}`);
  }

  /**
   * Resolves elements across any active language variant (EN, ID, etc.)
   * by matching exact text or regex.
   */
  getByI18n(variants: readonly string[] | string[]): Locator {
    const pattern = new RegExp(variants.map(v => `^${v.trim()}$`).join('|'), 'i');
    return this.page.getByText(pattern);
  }

  /**
   * Helper to click an element with automatic visibility check
   */
  async click(locator: Locator | string): Promise<void> {
    const loc = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(loc).toBeVisible();
    await loc.click();
  }

  /**
   * Helper to fill input field with automatic clearing
   */
  async fill(locator: Locator | string, value: string): Promise<void> {
    const loc = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(loc).toBeVisible();
    await loc.fill(value);
  }

  /**
   * Helper to get inner text
   */
  async getText(locator: Locator | string): Promise<string> {
    const loc = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await expect(loc).toBeVisible();
    return (await loc.innerText()).trim();
  }

  /**
   * Helper to check if locator is visible without throwing
   */
  async isVisible(locator: Locator | string): Promise<boolean> {
    const loc = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await loc.isVisible();
  }
}

export default BasePage;
