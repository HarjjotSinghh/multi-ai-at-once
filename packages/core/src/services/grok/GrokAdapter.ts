import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { CookieData } from '../../types';
import { GROK_SELECTORS } from './selectors';

export class GrokAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string, cookies?: CookieData[]) {
    super('grok', GROK_SELECTORS, browserManager, contextId, cookies);
  }
}
