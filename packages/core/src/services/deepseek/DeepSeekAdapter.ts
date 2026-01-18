import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { DEEPSEEK_SELECTORS } from './selectors';

export class DeepSeekAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string) {
    super('deepseek', DEEPSEEK_SELECTORS, browserManager, contextId);
  }
}
