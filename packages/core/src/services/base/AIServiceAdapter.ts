import { Page } from 'playwright';
import { IAIService, AIServiceName, ServiceSelectors, AIResponse, ResponseStatus } from '../../types';
import { BrowserManager } from '../../browser/BrowserManager';
import {
  ElementNotFoundError,
  PageOperationError,
  ResponseExtractionError,
  ServiceTimeoutError,
} from '../../errors';

/**
 * Abstract base class for all AI service adapters
 * Provides common functionality for browser automation
 */
export abstract class AIServiceAdapter implements IAIService {
  protected page: Page | null = null;
  protected browserManager: BrowserManager;
  protected contextId: string;
  protected pageId: string;
  protected selectors: ServiceSelectors;

  readonly serviceName: AIServiceName;
  readonly baseUrl: string;

  constructor(
    serviceName: AIServiceName,
    selectors: ServiceSelectors,
    browserManager: BrowserManager,
    contextId?: string
  ) {
    this.serviceName = serviceName;
    this.baseUrl = selectors.url;
    this.selectors = selectors;
    this.browserManager = browserManager;
    this.contextId = contextId || `${serviceName}-context`;
    this.pageId = `${serviceName}-page`;
  }

  /**
   * Initialize the service by navigating to the URL
   */
  async initialize(): Promise<void> {
    if (!this.page || this.page.isClosed()) {
      this.page = await this.browserManager.openPage(this.contextId, this.pageId);
    }

    await this.page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await this.waitForReady();
  }

  /**
   * Send a prompt to the AI service
   * @param prompt - The prompt text to send
   * @returns Promise resolving to the AI response
   */
  async sendPrompt(prompt: string, timeout: number = 60000): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Ensure we're initialized
      if (!this.page || this.page.isClosed()) {
        await this.initialize();
      }

      // Type the prompt
      await this.typePrompt(prompt);

      // Submit the prompt
      await this.submitPrompt();

      // Wait for response
      const content = await this.waitForResponse(timeout);

      const responseTime = Date.now() - startTime;

      return {
        serviceName: this.serviceName,
        content,
        status: 'success',
        responseTime,
        timestamp: new Date(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (error instanceof ServiceTimeoutError) {
        return {
          serviceName: this.serviceName,
          content: '',
          status: 'timeout',
          error: error.message,
          responseTime,
          timestamp: new Date(),
        };
      }

      return {
        serviceName: this.serviceName,
        content: '',
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        responseTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check if the service is ready to accept prompts
   */
  async isReady(): Promise<boolean> {
    if (!this.page || this.page.isClosed()) {
      return false;
    }

    try {
      if (this.selectors.readySelector) {
        await this.waitForElement(this.selectors.readySelector, { timeout: 5000 });
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    // Don't close the page or context as they may be shared
    // Just clear the reference
    this.page = null;
  }

  /**
   * Type the prompt into the textarea
   */
  protected async typePrompt(prompt: string): Promise<void> {
    if (!this.page) {
      throw new PageOperationError('Page not initialized', this.serviceName);
    }

    const textarea = await this.waitForElement(this.selectors.textareaSelector);
    if (!textarea) {
      throw new ElementNotFoundError(this.selectors.textareaSelector, this.serviceName);
    }
    await textarea.fill(prompt);
  }

  /**
   * Submit the prompt by clicking the submit button
   */
  protected async submitPrompt(): Promise<void> {
    if (!this.page) {
      throw new PageOperationError('Page not initialized', this.serviceName);
    }

    const submitButton = await this.waitForElement(this.selectors.submitSelector);
    if (!submitButton) {
      throw new ElementNotFoundError(this.selectors.submitSelector, this.serviceName);
    }
    await submitButton.click();
  }

  /**
   * Wait for the response to be generated and extract it
   * @param timeout - Maximum time to wait in milliseconds
   * @returns The response content
   */
  protected async waitForResponse(timeout: number): Promise<string> {
    if (!this.page) {
      throw new PageOperationError('Page not initialized', this.serviceName);
    }

    const startTime = Date.now();

    try {
      // Wait for loading to complete if a selector is provided
      if (this.selectors.loadingSelector) {
        try {
          await this.page.waitForSelector(this.selectors.loadingSelector, {
            state: 'attached',
            timeout: 5000,
          });

          // Wait for loading to disappear
          await this.page.waitForSelector(this.selectors.loadingSelector, {
            state: 'detached',
            timeout: timeout - (Date.now() - startTime),
          });
        } catch {
          // Loading selector might not appear, continue
        }
      }

      // Wait for response element to appear
      await this.page.waitForSelector(this.selectors.responseSelector, {
        timeout: timeout - (Date.now() - startTime),
      });

      // Extract the response
      const content = await this.extractResponse();

      return content;
    } catch (error) {
      if (Date.now() - startTime >= timeout) {
        throw new ServiceTimeoutError(this.serviceName, timeout);
      }
      throw new ResponseExtractionError(
        this.serviceName,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Extract the response content from the page
   * Should be overridden by subclasses if needed
   */
  protected async extractResponse(): Promise<string> {
    if (!this.page) {
      throw new PageOperationError('Page not initialized', this.serviceName);
    }

    const responseElement = await this.page.$(this.selectors.responseSelector);
    if (!responseElement) {
      throw new ElementNotFoundError(this.selectors.responseSelector, this.serviceName);
    }

    const content = await responseElement.textContent();
    return (content || '').trim();
  }

  /**
   * Wait for an element to appear on the page
   * @param selector - CSS selector for the element
   * @param options - Wait options
   * @returns The element handle
   */
  protected async waitForElement(
    selector: string,
    options: { timeout?: number; state?: 'attached' | 'detached' | 'visible' | 'hidden' } = {}
  ): Promise<ReturnType<Page['waitForSelector']>> {
    if (!this.page) {
      throw new PageOperationError('Page not initialized', this.serviceName);
    }

    const { timeout = 30000, state = 'attached' } = options;

    try {
      return await this.page.waitForSelector(selector, { timeout, state });
    } catch (error) {
      throw new ElementNotFoundError(selector, this.serviceName);
    }
  }

  /**
   * Wait for the service to be ready
   * Can be overridden by subclasses for custom ready logic
   */
  protected async waitForReady(): Promise<void> {
    if (this.selectors.readySelector) {
      await this.waitForElement(this.selectors.readySelector);
    } else {
      // Default: wait for textarea to be available
      await this.waitForElement(this.selectors.textareaSelector);
    }
  }
}
