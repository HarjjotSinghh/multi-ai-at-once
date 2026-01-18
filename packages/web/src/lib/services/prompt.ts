/**
 * Server Actions for prompt handling
 */

'use server';

import { BrowserManager, ServiceFactory, IAIService } from '@multi-ai/core';
import { AIServiceName } from '@multi-ai/core';
import { getBrowserManager, releaseBrowserManager } from '@/lib/browser/singleton';
import { SendPromptResult } from '@/types';

/**
 * Send a prompt to multiple AI services
 * @param prompt - The prompt text to send
 * @param services - Array of service names to use
 * @param timeout - Optional timeout in milliseconds
 * @returns Result with responses from all services
 */
export async function sendPromptAction(
  prompt: string,
  services: AIServiceName[],
  timeout?: number
): Promise<SendPromptResult> {
  const browserManager = await getBrowserManager();

  try {
    const factory = new ServiceFactory(browserManager);
    const aiServices = factory.createServices(services);

    // Initialize all services
    await Promise.all(
      aiServices.map((service) => service.initialize().catch((err) => {
        console.error(`Failed to initialize ${service.serviceName}:`, err);
      }))
    );

    // Send prompts concurrently with timeout
    const results = await Promise.allSettled(
      aiServices.map((service) => service.sendPrompt(prompt, timeout))
    );

    // Convert results to AIResponse array
    const responses = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          serviceName: services[index],
          content: '',
          status: 'error' as const,
          error: result.reason?.message || 'Unknown error',
          responseTime: 0,
          timestamp: new Date(),
        };
      }
    });

    // Cleanup services
    await Promise.allSettled(
      aiServices.map((service) => service.cleanup())
    );

    return {
      id: crypto.randomUUID(),
      responses,
      timestamp: new Date(),
    };
  } finally {
    await releaseBrowserManager();
  }
}

/**
 * Get available services
 * @returns Array of available service names
 */
export async function getAvailableServicesAction(): Promise<AIServiceName[]> {
  return ServiceFactory.getAvailableServices();
}

/**
 * Validate service availability
 * @param services - Array of service names to validate
 * @returns Object with validation results
 */
export async function validateServicesAction(
  services: AIServiceName[]
): Promise<{ valid: AIServiceName[]; invalid: AIServiceName[] }> {
  const available = ServiceFactory.getAvailableServices();
  const valid = services.filter((s) => available.includes(s));
  const invalid = services.filter((s) => !available.includes(s));

  return { valid, invalid };
}
