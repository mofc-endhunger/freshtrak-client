import { Page, Locator } from '@playwright/test';
import { TIMEOUTS } from '../utils/constants';

/**
 * Base Page Object
 * 
 * Abstract base class for all Page Objects
 * Provides common functionality and structure
 */
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the page
   */
  abstract navigate(): Promise<void>;

  /**
   * Wait for page to load
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for element to be visible
   */
  protected async waitForElement(selector: string, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  protected async waitForElementHidden(selector: string, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  /**
   * Click element
   */
  protected async click(selector: string, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const { timeout = TIMEOUTS.MEDIUM, force = false } = options || {};
    await this.waitForElement(selector, timeout);
    if (force) {
      await this.page.click(selector, { force: true });
    } else {
      await this.page.click(selector);
    }
  }

  /**
   * Fill input field
   */
  protected async fill(selector: string, value: string, options?: { clear?: boolean; timeout?: number }): Promise<void> {
    const { clear = true, timeout = TIMEOUTS.MEDIUM } = options || {};
    await this.waitForElement(selector, timeout);
    if (clear) {
      await this.page.fill(selector, '');
    }
    await this.page.fill(selector, value);
  }

  /**
   * Get element text
   */
  protected async getText(selector: string, timeout: number = TIMEOUTS.MEDIUM): Promise<string | null> {
    await this.waitForElement(selector, timeout);
    return await this.page.locator(selector).textContent();
  }

  /**
   * Check if element is visible
   */
  protected async isVisible(selector: string, timeout: number = TIMEOUTS.SHORT): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get locator
   */
  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(path: string): Promise<void> {
    await this.page.screenshot({ path });
  }
}

