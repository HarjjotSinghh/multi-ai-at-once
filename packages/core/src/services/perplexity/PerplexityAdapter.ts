import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { PERPLEXITY_SELECTORS } from './selectors';

export class PerplexityAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string) {
    super('perplexity', PERPLEXITY_SELECTORS, browserManager, contextId);
  }
}
