import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { GROK_SELECTORS } from './selectors';

export class GrokAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string) {
    super('grok', GROK_SELECTORS, browserManager, contextId);
  }
}
