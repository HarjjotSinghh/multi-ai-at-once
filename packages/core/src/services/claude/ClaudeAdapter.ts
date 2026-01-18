import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { CookieData } from '../../types';
import { CLAUDE_SELECTORS } from './selectors';

export class ClaudeAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string, cookies?: CookieData[]) {
    super('claude', CLAUDE_SELECTORS, browserManager, contextId, cookies);
  }
}
