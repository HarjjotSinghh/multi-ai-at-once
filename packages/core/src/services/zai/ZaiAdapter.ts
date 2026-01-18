import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { CookieData } from '../../types';
import { ZAI_SELECTORS } from './selectors';

export class ZaiAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string, cookies?: CookieData[]) {
    super('zai', ZAI_SELECTORS, browserManager, contextId, cookies);
  }
}
