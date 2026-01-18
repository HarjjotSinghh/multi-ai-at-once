import { ServiceSelectors } from '../../types';

export const GROK_SELECTORS: ServiceSelectors = {
  url: 'https://grok.com/',
  textareaSelector: 'div[contenteditable="true"]',
  submitSelector: 'button[aria-label="Send"]',
  responseSelector: '[data-testid="message-content"]',
  readySelector: 'div[contenteditable="true"]',
  loadingSelector: '.streaming',
};
