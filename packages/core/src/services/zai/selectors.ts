import { ServiceSelectors } from '../../types';

export const ZAI_SELECTORS: ServiceSelectors = {
  url: 'https://z.ai/',
  textareaSelector: 'textarea[placeholder*="Type"]',
  submitSelector: 'button[type="submit"]',
  responseSelector: '.ai-response',
  readySelector: 'textarea[placeholder*="Type"]',
  loadingSelector: '.loading',
};
