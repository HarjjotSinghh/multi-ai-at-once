import { ServiceSelectors } from '../../types';

export const CLAUDE_SELECTORS: ServiceSelectors = {
  url: 'https://claude.ai/',
  textareaSelector: 'div[contenteditable="true"]',
  submitSelector: 'button[type="submit"]',
  responseSelector: '[data-is-streaming="false"] .font-claude-message',
  readySelector: 'div[contenteditable="true"]',
  loadingSelector: '[data-is-streaming="true"]',
};
