import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { CookieData } from '../../types';
import { GEMINI_SELECTORS } from './selectors';

export class GeminiAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string, cookies?: CookieData[]) {
    super('gemini', GEMINI_SELECTORS, browserManager, contextId, cookies);
  }
}
