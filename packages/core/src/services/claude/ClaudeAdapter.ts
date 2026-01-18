import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { CLAUDE_SELECTORS } from './selectors';

export class ClaudeAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string) {
    super('claude', CLAUDE_SELECTORS, browserManager, contextId);
  }
}
