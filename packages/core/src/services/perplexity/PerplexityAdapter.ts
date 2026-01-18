import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { CookieData } from '../../types';
import { PERPLEXITY_SELECTORS } from './selectors';

export class PerplexityAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string, cookies?: CookieData[]) {
    super('perplexity', PERPLEXITY_SELECTORS, browserManager, contextId, cookies);
  }
}
