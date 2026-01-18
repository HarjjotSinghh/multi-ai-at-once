import { ServiceSelectors } from '../../types';

export const PERPLEXITY_SELECTORS: ServiceSelectors = {
  url: 'https://www.perplexity.ai/',
  textareaSelector: '[role="textbox"]',
  submitSelector: 'button[type="submit"]',
  responseSelector: '.answer-content',
  readySelector: '[role="textbox"]',
  loadingSelector: '.loading-spinner',
};
