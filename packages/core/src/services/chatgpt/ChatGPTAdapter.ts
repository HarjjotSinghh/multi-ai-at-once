import { AIServiceAdapter } from '../base/AIServiceAdapter';
import { BrowserManager } from '../../browser/BrowserManager';
import { CookieData } from '../../types';
import { CHATGPT_SELECTORS } from './selectors';

export class ChatGPTAdapter extends AIServiceAdapter {
  constructor(browserManager: BrowserManager, contextId?: string, cookies?: CookieData[]) {
    super('chatgpt', CHATGPT_SELECTORS, browserManager, contextId, cookies);
  }
}
