import { ServiceSelectors } from '../../types';

export const CHATGPT_SELECTORS: ServiceSelectors = {
  url: 'https://chatgpt.com/',
  textareaSelector: '#prompt-textarea',
  submitSelector: 'button[data-testid="send-button"]',
  responseSelector: '[data-message-author-role="assistant"]',
  readySelector: '#prompt-textarea',
  loadingSelector: '.result-streaming',
};
