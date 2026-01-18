import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import {
  BrowserManager,
  ConfigManager,
  ServiceFactory,
  AIServiceName,
  AIResponse,
  MultiAIConfig,
} from '@multi-ai/core';
import { displayTable, displayJSON, displayMarkdown } from '../ui/table';

export interface PromptOptions {
  services?: string;
  format?: 'table' | 'json' | 'markdown';
  headless?: boolean;
  timeout?: number;
}

/**
 * Execute prompt command
 */
export async function handlePrompt(prompt: string, options: PromptOptions): Promise<void> {
  const configManager = new ConfigManager();
  await configManager.load();

  const config = configManager.get();

  // Parse services from options or use config
  let services: AIServiceName[];
  if (options.services) {
    services = options.services.split(',').map((s) => s.trim().toLowerCase() as AIServiceName);
  } else {
    services = config.services || [];
  }

  // Validate services
  const availableServices = ServiceFactory.getAvailableServices();
  const invalidServices = services.filter((s) => !availableServices.includes(s));

  if (invalidServices.length > 0) {
    console.error(chalk.red(`Invalid services: ${invalidServices.join(', ')}`));
    console.error(chalk.yellow(`Available services: ${availableServices.join(', ')}`));
    process.exit(1);
  }

  if (services.length === 0) {
    console.error(chalk.red('No services specified. Use -s option or configure default services.'));
    console.error(chalk.yellow(`Available services: ${availableServices.join(', ')}`));
    process.exit(1);
  }

  // Determine output format
  const format = options.format || config.output?.format || 'table';

  // Initialize browser manager
  const browserConfig = {
    ...config.browser,
    headless: options.headless ?? config.browser?.headless ?? false,
  };

  const spinner = ora('Initializing browser...').start();

  try {
    const browserManager = new BrowserManager(browserConfig);
    await browserManager.initialize();

    spinner.text = `Initializing ${services.length} service(s)...`;

    const factory = new ServiceFactory(browserManager);
    const aiServices = factory.createServices(services);

    // Initialize all services
    await Promise.all(aiServices.map((service) => service.initialize()));

    spinner.text = `Sending prompt to ${services.length} service(s)...`;

    const timeout = options.timeout || config.responseTimeout || 60000;

    // Send prompts concurrently
    const startTime = Date.now();
    const results = await Promise.allSettled(
      aiServices.map((service) => service.sendPrompt(prompt))
    );

    // Convert results to AIResponse array
    const responses: AIResponse[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          serviceName: services[index],
          content: '',
          status: 'error',
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
          responseTime: Date.now() - startTime,
          timestamp: new Date(),
        };
      }
    });

    // Clean up services
    await Promise.all(aiServices.map((service) => service.cleanup()));
    await browserManager.close();

    spinner.succeed(`Received ${responses.filter((r) => r.status === 'success').length}/${responses.length} responses`);

    // Display results
    switch (format) {
      case 'json':
        displayJSON(responses);
        break;
      case 'markdown':
        displayMarkdown(responses, config.output);
        break;
      case 'table':
      default:
        displayTable(responses, config.output);
        break;
    }
  } catch (error) {
    spinner.fail('Failed to send prompt');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Create the prompt command
 */
export function createPromptCommand(): Command {
  const cmd = new Command('prompt')
    .description('Send a prompt to multiple AI services')
    .argument('<prompt>', 'The prompt to send')
    .option('-s, --services <services>', 'Comma-separated list of services (e.g., chatgpt,claude,gemini)')
    .option('-f, --format <format>', 'Output format: table, json, or markdown', 'table')
    .option('--headless', 'Run browser in headless mode', false)
    .option('-t, --timeout <ms>', 'Response timeout in milliseconds', '60000')
    .action(handlePrompt);

  return cmd;
}
