/**
 * BrowserManager Singleton
 *
 * Manages a single browser instance with connection pooling
 * for server-side AI service automation in Next.js.
 */

import { BrowserManager, BrowserConfig } from '@multi-ai/core';

let globalBrowserManager: BrowserManager | null = null;
let sessionCount = 0;
let cleanupTimer: NodeJS.Timeout | null = null;

const MAX_CONCURRENT_SESSIONS = 3;
const CLEANUP_DELAY_MS = 5000;

/**
 * Get or create the singleton BrowserManager instance
 * @returns The shared BrowserManager instance
 */
export async function getBrowserManager(): Promise<BrowserManager> {
  if (!globalBrowserManager) {
    const config: BrowserConfig = {
      headless: process.env.HEADLESS !== 'false',
      viewportWidth: 1280,
      viewportHeight: 720,
      timeout: 30000,
    };

    globalBrowserManager = new BrowserManager(config);
    await globalBrowserManager.initialize();
  }

  sessionCount++;
  cancelCleanup();

  return globalBrowserManager;
}

/**
 * Release a session, decrementing the reference count
 * Schedules cleanup after delay if no sessions remain
 */
export async function releaseBrowserManager(): Promise<void> {
  sessionCount = Math.max(0, sessionCount - 1);

  if (sessionCount === 0 && globalBrowserManager) {
    scheduleCleanup();
  }
}

/**
 * Get current session count
 */
export function getSessionCount(): number {
  return sessionCount;
}

/**
 * Immediately cleanup and close the browser
 * Call this on shutdown or when force-closing is needed
 */
export async function forceCleanup(): Promise<void> {
  if (globalBrowserManager) {
    await globalBrowserManager.close();
    globalBrowserManager = null;
  }
  sessionCount = 0;
  cancelCleanup();
}

/**
 * Schedule cleanup after delay
 */
function scheduleCleanup(): void {
  cancelCleanup();
  cleanupTimer = setTimeout(async () => {
    if (sessionCount === 0 && globalBrowserManager) {
      await globalBrowserManager.close();
      globalBrowserManager = null;
    }
  }, CLEANUP_DELAY_MS);
}

/**
 * Cancel scheduled cleanup
 */
function cancelCleanup(): void {
  if (cleanupTimer) {
    clearTimeout(cleanupTimer);
    cleanupTimer = null;
  }
}

/**
 * Check if browser is initialized
 */
export function isBrowserReady(): boolean {
  return globalBrowserManager?.isInitialized() ?? false;
}
