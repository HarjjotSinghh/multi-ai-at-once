import { ServiceSelectors } from '../../types';

export const GEMINI_SELECTORS: ServiceSelectors = {
  url: 'https://gemini.google.com/',
  textareaSelector: 'rich-textarea',
  submitSelector: 'button[aria-label="Send message"]',
  responseSelector: 'model-response',
  readySelector: 'rich-textarea',
  loadingSelector: '.loading-indicator',
};
