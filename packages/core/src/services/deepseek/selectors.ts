import { ServiceSelectors } from '../../types';

export const DEEPSEEK_SELECTORS: ServiceSelectors = {
  url: 'https://chat.deepseek.com/',
  textareaSelector: 'textarea[placeholder*="Message"]',
  submitSelector: 'button[type="submit"]',
  responseSelector: '.message.assistant',
  readySelector: 'textarea[placeholder*="Message"]',
  loadingSelector: '.thinking',
};
