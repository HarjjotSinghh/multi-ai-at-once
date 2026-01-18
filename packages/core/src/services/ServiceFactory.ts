import { BrowserManager } from '../browser/BrowserManager';
import { AIServiceName, IAIService } from '../types';
import { ChatGPTAdapter } from './chatgpt/ChatGPTAdapter';
import { ClaudeAdapter } from './claude/ClaudeAdapter';
import { GeminiAdapter } from './gemini/GeminiAdapter';
import { PerplexityAdapter } from './perplexity/PerplexityAdapter';
import { GrokAdapter } from './grok/GrokAdapter';
import { DeepSeekAdapter } from './deepseek/DeepSeekAdapter';
import { ZaiAdapter } from './zai/ZaiAdapter';

/**
 * Factory for creating AI service adapters
 */
export class ServiceFactory {
  private browserManager: BrowserManager;

  constructor(browserManager: BrowserManager) {
    this.browserManager = browserManager;
  }

  /**
   * Create a service adapter for the specified service
   * @param serviceName - The name of the service to create
   * @param contextId - Optional context ID for the service
   * @returns The created service adapter
   */
  createService(serviceName: AIServiceName, contextId?: string): IAIService {
    switch (serviceName) {
      case 'chatgpt':
        return new ChatGPTAdapter(this.browserManager, contextId);
      case 'claude':
        return new ClaudeAdapter(this.browserManager, contextId);
      case 'gemini':
        return new GeminiAdapter(this.browserManager, contextId);
      case 'perplexity':
        return new PerplexityAdapter(this.browserManager, contextId);
      case 'grok':
        return new GrokAdapter(this.browserManager, contextId);
      case 'deepseek':
        return new DeepSeekAdapter(this.browserManager, contextId);
      case 'zai':
        return new ZaiAdapter(this.browserManager, contextId);
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }

  /**
   * Create multiple service adapters
   * @param services - Array of service names to create
   * @param contextId - Optional shared context ID
   * @returns Array of created service adapters
   */
  createServices(services: AIServiceName[], contextId?: string): IAIService[] {
    return services.map((service) => this.createService(service, contextId));
  }

  /**
   * Get a list of all available service names
   */
  static getAvailableServices(): AIServiceName[] {
    return ['chatgpt', 'claude', 'gemini', 'perplexity', 'grok', 'deepseek', 'zai'];
  }
}
