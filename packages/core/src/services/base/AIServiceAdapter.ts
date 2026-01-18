import { Page } from 'playwright';
import { IAIService, AIServiceName, ServiceSelectors, AIResponse, ResponseStatus, CookieData } from '../../types';
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
  protected cookies: CookieData[] | null = null;
  protected hasStoredCookies: boolean = false;

  readonly serviceName: AIServiceName;
  readonly baseUrl: string;

  constructor(
    serviceName: AIServiceName,
    selectors: ServiceSelectors,
    browserManager: BrowserManager,
    contextId?: string,
    cookies?: CookieData[]
  ) {
    this.serviceName = serviceName;
    this.baseUrl = selectors.url;
    this.selectors = selectors;
    this.browserManager = browserManager;
    this.contextId = contextId || `${serviceName}-context`;
    this.pageId = `${serviceName}-page`;
    this.cookies = cookies ?? null;
    this.hasStoredCookies = cookies !== undefined && cookies !== null && cookies.length > 0;
  }

  /**
   * Initialize the service by navigating to the URL
   */
  async initialize(): Promise<void> {
    if (!this.page || this.page.isClosed()) {
      this.page = await this.browserManager.openPage(this.contextId, this.pageId, this.cookies || undefined);
    }

    await this.page.goto(this.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`[${this.serviceName}] Navigated to ${this.baseUrl}`);
    
    // Only wait for login if we don't have stored cookies
    if (!this.hasStoredCookies) {
      console.log(`[${this.serviceName}] Checking login requirements...`);
      await this.waitForLogin();
    }
    
    console.log(`[${this.serviceName}] Waiting for ready state...`);
    await this.waitForReady();
    console.log(`[${this.serviceName}] Initialized and ready!`);
  }

  /**
   * Wait for user to complete login if on a login page
   * Checks for common login indicators and waits until user is authenticated
   */
  protected async waitForLogin(): Promise<void> {
    if (!this.page) {
      throw new PageOperationError('Page not initialized', this.serviceName);
    }

    // Wait a bit for page to fully load
    await this.page.waitForTimeout(2000);

    // Check if we're on a login page or error page using JavaScript evaluation
    let isLoginPage = false;
    // Retry loop for initial check to handle navigation/context destruction
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (this.page.isClosed()) return;
        
        isLoginPage = await this.page.evaluate(() => {
          // @ts-ignore - This code runs in browser context
          const bodyText = document.body.textContent?.toLowerCase() || '';
          // @ts-ignore - This code runs in browser context
          const url = window.location.href.toLowerCase();
          // @ts-ignore - This code runs in browser context
          const pageTitle = document.title?.toLowerCase() || '';
          
          // Check for Google's specific error messages
          const hasGoogleError = 
            bodyText.includes("couldn't sign you in") ||
            bodyText.includes('this browser or app may not be secure') ||
            bodyText.includes('browser or app may not be secure') ||
            url.includes('/signin/rejected') ||
            url.includes('/signin/challenge');
          
          // Check for login-related text
          const hasLoginText = 
            bodyText.includes('sign in') ||
            bodyText.includes('log in') ||
            bodyText.includes('login') ||
            bodyText.includes('sign up') ||
            bodyText.includes('continue with google') ||
            bodyText.includes('continue with email') ||
            pageTitle.includes('sign in') ||
            pageTitle.includes('log in');
          
          // Check for login-related URL paths
          const hasLoginPath = 
            url.includes('/login') ||
            url.includes('/signin') ||
            url.includes('/sign-in') ||
            url.includes('/auth') ||
            url.includes('/account') ||
            url.includes('accounts.google.com');
          
          // Check for login form elements
          // @ts-ignore - This code runs in browser context
          const hasLoginForm = 
            // @ts-ignore - This code runs in browser context
            document.querySelector('input[type="email"]') !== null ||
            // @ts-ignore - This code runs in browser context
            document.querySelector('input[type="password"]') !== null ||
            // @ts-ignore - This code runs in browser context
            document.querySelector('form')?.querySelector('input[type="password"]') !== null;
          
          return hasGoogleError || hasLoginText || hasLoginPath || hasLoginForm;
        });
        break; // Success
      } catch (error) {
        // If context destroyed, wait and retry
        if (attempt === 2) {
             console.warn(`[${this.serviceName}] Failed to check login status after 3 attempts: ${error}`);
             // Assume not login page to prevent blocking, or let it throw?
             // Letting it throw might be better to signal failure.
             // But valid flow might be just loaded.
        }
        await this.page.waitForTimeout(1000);
      }
    }

    if (isLoginPage) {
      console.log(`[${this.serviceName}] Detect login page, waiting for login...`);
      // Wait for the ready selector to appear, which indicates successful login
      // Poll every 2 seconds to check if user has logged in
      const maxWaitTime = 300000; // 5 minutes
      const pollInterval = 2000; // 2 seconds
      const startTime = Date.now();
      let lastUrl = this.page.url();
      
      while (Date.now() - startTime < maxWaitTime) {
        try {
          if (this.page.isClosed()) {
             throw new PageOperationError('Page closed during login wait', this.serviceName);
          }

          // Check if URL changed (user might have navigated)
          const currentUrl = this.page.url();
          if (currentUrl !== lastUrl) {
            console.log(`[${this.serviceName}] URL changed: ${currentUrl}`);
            lastUrl = currentUrl;
            // Wait a bit for new page to load
            await this.page.waitForTimeout(1000);
          }

          // Try to find the ready selector
          const readyElement = await this.page.$(this.selectors.readySelector || this.selectors.textareaSelector);
          if (readyElement) {
            const isVisible = await readyElement.isVisible().catch(() => false);
            if (isVisible) {
              console.log(`[${this.serviceName}] Ready element found and visible!`);
              // Check if we're still on a login page or error page
              const stillOnLoginPage = await this.page.evaluate(() => {
                // @ts-ignore - This code runs in browser context
                const bodyText = document.body.textContent?.toLowerCase() || '';
                // @ts-ignore - This code runs in browser context
                const url = window.location.href.toLowerCase();
                return (
                  bodyText.includes("couldn't sign you in") ||
                  bodyText.includes('this browser or app may not be secure') ||
                  bodyText.includes('sign in') ||
                  bodyText.includes('log in') ||
                  url.includes('/login') ||
                  url.includes('/signin') ||
                  url.includes('/signin/rejected') ||
                  url.includes('/signin/challenge')
                );
              });
              
              if (!stillOnLoginPage) {
                // User has logged in successfully
                console.log(`[${this.serviceName}] Login successful!`);
                return;
              } else {
                 console.log(`[${this.serviceName}] Ready element visible but still detecting login text/url.`);
              }
            }
          }
          
          // Also check if we navigated away from login page to the main app
          const currentUrlLower = currentUrl.toLowerCase();
          if (!currentUrlLower.includes('/login') && 
              !currentUrlLower.includes('/signin') && 
              !currentUrlLower.includes('/signin/rejected') &&
              !currentUrlLower.includes('/signin/challenge') &&
              !currentUrlLower.includes('accounts.google.com')) {
            // Might have navigated to the main app, check for ready selector
            try {
              await this.page.waitForSelector(
                this.selectors.readySelector || this.selectors.textareaSelector,
                { timeout: 3000, state: 'visible' }
              );
              console.log(`[${this.serviceName}] Login successful (via URL check and wait)!`);
              return; // Found ready selector, login successful
            } catch {
              // Continue polling
            }
          }
        } catch (e) {
          console.warn(`[${this.serviceName}] Error in polling loop:`, e);
          // Continue polling
          if (this.page.isClosed()) throw e;
        }
        
        // Wait before next check
        if (!this.page.isClosed()) {
            await this.page.waitForTimeout(pollInterval);
        }
      }
      
      // Timeout - check if still on login page or error page
      let stillOnLoginPage = false;
      try {
         stillOnLoginPage = await this.page.evaluate(() => {
            // @ts-ignore - This code runs in browser context
            const bodyText = document.body.textContent?.toLowerCase() || '';
            // @ts-ignore - This code runs in browser context
            const url = window.location.href.toLowerCase();
            return (
              bodyText.includes("couldn't sign you in") ||
              bodyText.includes('this browser or app may not be secure') ||
              bodyText.includes('sign in') ||
              bodyText.includes('log in') ||
              url.includes('/login') ||
              url.includes('/signin') ||
              url.includes('/signin/rejected') ||
              url.includes('/signin/challenge')
            );
         });
      } catch (e) {
          // If e.g. execution context destroyed here, assume we might be ok or fail.
          // But likely we timed out.
      }

      if (stillOnLoginPage) {
        // Check if it's a Google security error
        const isGoogleError = await this.page.evaluate(() => {
          // @ts-ignore - This code runs in browser context
          const bodyText = document.body.textContent?.toLowerCase() || '';
          // @ts-ignore - This code runs in browser context
          const url = window.location.href.toLowerCase();
          return (
            bodyText.includes("couldn't sign you in") ||
            bodyText.includes('this browser or app may not be secure') ||
            url.includes('/signin/rejected')
          );
        });

        if (isGoogleError) {
          throw new PageOperationError(
            `Google security check detected: Please manually sign in to ${this.serviceName} in the browser window. You may need to click "Try again" or use a different authentication method. The automation will wait up to 5 minutes for you to complete login.`,
            this.serviceName
          );
        } else {
          throw new PageOperationError(
            `Login timeout: Please log in to ${this.serviceName} in the browser window. The automation will wait up to 5 minutes for you to complete login.`,
            this.serviceName
          );
        }
      }
    }
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

    // Check if it's a contenteditable div - need to handle differently
    const tagName = await textarea.evaluate((el) => el.tagName.toLowerCase());
    const isContentEditable = await textarea.evaluate((el) => 'contentEditable' in el && (el as any).contentEditable === 'true');

    if (isContentEditable || tagName === 'div') {
      // For contenteditable divs, use type() or set textContent
      await textarea.click();
      await textarea.fill('');
      await textarea.type(prompt, { delay: 0 });
    } else {
      // For textareas and inputs, use fill()
      await textarea.fill(prompt);
    }
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
