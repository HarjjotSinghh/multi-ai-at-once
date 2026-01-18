import { chromium, Browser, BrowserContext, Page, BrowserType } from 'playwright';
import { BrowserConfig } from '../types';
import { BrowserInitializationError } from '../errors';

/**
 * Manages browser instances, contexts, and pages for concurrent AI service automation
 */
export class BrowserManager {
  private browser: Browser | null = null;
  private contexts: Map<string, BrowserContext> = new Map();
  private pages: Map<string, Page> = new Map();
  private config: Required<BrowserConfig>;

  private static readonly DEFAULT_CONFIG: Required<BrowserConfig> = {
    headless: false,
    viewportWidth: 1280,
    viewportHeight: 720,
    timeout: 30000,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    bypassCSP: false,
  };

  constructor(config: BrowserConfig = {}) {
    this.config = {
      ...BrowserManager.DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Initialize the browser instance
   */
  async initialize(): Promise<void> {
    if (this.browser) {
      return;
    }

    try {
      this.browser = await chromium.launch({
        headless: this.config.headless,
      });
    } catch (error) {
      throw new BrowserInitializationError(
        `Failed to launch browser: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create a new browser context with the given identifier
   * @param id - Unique identifier for the context
   * @returns The created BrowserContext
   */
  async createContext(id: string): Promise<BrowserContext> {
    if (!this.browser) {
      await this.initialize();
    }

    if (this.contexts.has(id)) {
      return this.contexts.get(id)!;
    }

    const context = await this.browser!.newContext({
      viewport: {
        width: this.config.viewportWidth,
        height: this.config.viewportHeight,
      },
      userAgent: this.config.userAgent,
      bypassCSP: this.config.bypassCSP,
    });

    context.setDefaultTimeout(this.config.timeout);
    this.contexts.set(id, context);

    return context;
  }

  /**
   * Get an existing context or create a new one
   * @param id - Context identifier
   * @returns The BrowserContext
   */
  async getContext(id: string): Promise<BrowserContext> {
    if (this.contexts.has(id)) {
      return this.contexts.get(id)!;
    }
    return this.createContext(id);
  }

  /**
   * Create a new page in the specified context
   * @param contextId - Context identifier
   * @param pageId - Page identifier
   * @returns The created Page
   */
  async openPage(contextId: string, pageId: string): Promise<Page> {
    const context = await this.getContext(contextId);

    if (this.pages.has(pageId)) {
      const page = this.pages.get(pageId)!;
      // Verify the page is still valid
      try {
        await page.evaluate(() => true);
        return page;
      } catch {
        // Page is closed or invalid, remove and recreate
        this.pages.delete(pageId);
      }
    }

    const page = await context.newPage();
    this.pages.set(pageId, page);

    return page;
  }

  /**
   * Get an existing page by ID
   * @param pageId - Page identifier
   * @returns The Page or undefined if not found
   */
  getPage(pageId: string): Page | undefined {
    return this.pages.get(pageId);
  }

  /**
   * Close a specific page
   * @param pageId - Page identifier
   */
  async closePage(pageId: string): Promise<void> {
    const page = this.pages.get(pageId);
    if (page && !page.isClosed()) {
      await page.close();
    }
    this.pages.delete(pageId);
  }

  /**
   * Close a specific context and all its pages
   * @param contextId - Context identifier
   */
  async closeContext(contextId: string): Promise<void> {
    const context = this.contexts.get(contextId);
    if (context) {
      await context.close();
      this.contexts.delete(contextId);

      // Remove all pages associated with this context
      for (const [pageId, page] of this.pages.entries()) {
        if (page.context() === context) {
          this.pages.delete(pageId);
        }
      }
    }
  }

  /**
   * Close all contexts and pages, then close the browser
   */
  async close(): Promise<void> {
    // Close all pages
    for (const [pageId, page] of this.pages.entries()) {
      if (!page.isClosed()) {
        await page.close().catch(() => {
          // Ignore errors during close
        });
      }
    }
    this.pages.clear();

    // Close all contexts
    for (const [contextId, context] of this.contexts.entries()) {
      await context.close().catch(() => {
        // Ignore errors during close
      });
    }
    this.contexts.clear();

    // Close browser
    if (this.browser) {
      await this.browser.close().catch(() => {
        // Ignore errors during close
      });
      this.browser = null;
    }
  }

  /**
   * Check if the browser is initialized
   */
  isInitialized(): boolean {
    return this.browser !== null && this.browser.isConnected();
  }

  /**
   * Get the number of active contexts
   */
  getActiveContextsCount(): number {
    return this.contexts.size;
  }

  /**
   * Get the number of active pages
   */
  getActivePagesCount(): number {
    return this.pages.size;
  }

  /**
   * Get the underlying browser instance
   * @throws Error if browser is not initialized
   */
  getBrowser(): Browser {
    if (!this.browser) {
      throw new BrowserInitializationError('Browser not initialized');
    }
    return this.browser;
  }
}
