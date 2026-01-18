import { ServiceSelectors } from '../../types';

export const PERPLEXITY_SELECTORS: ServiceSelectors = {
  url: 'https://www.perplexity.ai/',
  textareaSelector: 'textarea[placeholder*="ask"]',
  submitSelector: 'button[type="submit"]',
  responseSelector: '.answer-content',
  readySelector: 'textarea[placeholder*="ask"]',
  loadingSelector: '.loading-spinner',
};
