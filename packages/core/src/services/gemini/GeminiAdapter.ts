import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { GEMINI_SELECTORS } from './selectors';

export class GeminiAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string) {
    super('gemini', GEMINI_SELECTORS, browserManager, contextId);
  }
}
