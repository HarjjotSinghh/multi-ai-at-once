import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { CHATGPT_SELECTORS } from './selectors';

export class ChatGPTAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string) {
    super('chatgpt', CHATGPT_SELECTORS, browserManager, contextId);
  }
}
