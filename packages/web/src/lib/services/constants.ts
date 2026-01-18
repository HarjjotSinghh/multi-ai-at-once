import { AIServiceName } from '@multi-ai/core';
import { ServiceMetadata } from '@/types';

/**
 * Service metadata for UI display
 */
export const SERVICE_METADATA: Record<AIServiceName, ServiceMetadata> = {
  chatgpt: {
    name: 'chatgpt',
    displayName: 'ChatGPT',
    icon: 'chatgpt.svg',
    color: '#10a37f',
    baseUrl: 'https://chatgpt.com',
  },
  claude: {
    name: 'claude',
    displayName: 'Claude',
    icon: 'claude.svg',
    color: '#cc785c',
    baseUrl: 'https://claude.ai',
  },
  gemini: {
    name: 'gemini',
    displayName: 'Gemini',
    icon: 'gemini.svg',
    color: '#4285f4',
    baseUrl: 'https://gemini.google.com',
  },
  perplexity: {
    name: 'perplexity',
    displayName: 'Perplexity',
    icon: 'perplexity.svg',
    color: '#20b8cd',
    baseUrl: 'https://perplexity.ai',
  },
  grok: {
    name: 'grok',
    displayName: 'Grok',
    icon: 'grok.svg',
    color: '#000000',
    baseUrl: 'https://grok.com',
  },
  deepseek: {
    name: 'deepseek',
    displayName: 'DeepSeek',
    icon: 'deepseek.svg',
    color: '#4d6bfe',
    baseUrl: 'https://deepseek.com',
  },
  zai: {
    name: 'zai',
    displayName: 'Zai',
    icon: 'zai.svg',
    color: '#8b5cf6',
    baseUrl: 'https://zai.com',
  },
};

/**
 * Get all service metadata as an array
 */
export function getAllServiceMetadata(): ServiceMetadata[] {
  return Object.values(SERVICE_METADATA);
}

/**
 * Get metadata for a specific service
 */
export function getServiceMetadata(name: AIServiceName): ServiceMetadata {
  return SERVICE_METADATA[name];
}

/**
 * Get available service names
 */
export function getAvailableServices(): AIServiceName[] {
  return Object.keys(SERVICE_METADATA) as AIServiceName[];
}
