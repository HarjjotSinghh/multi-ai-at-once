import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import {
  BrowserManager,
  ConfigManager,
  CookieManager,
  ServiceFactory,
  AIServiceName,
  AIResponse,
  MultiAIConfig,
  CookieData,
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

    // Load cookies for services
    const cookieManager = new CookieManager();
    const cookiesMap = new Map<AIServiceName, CookieData[]>();
    
    for (const service of services) {
      const serviceCookies = await cookieManager.getCookies(service);
      if (serviceCookies && serviceCookies.cookies.length > 0) {
        cookiesMap.set(service, serviceCookies.cookies);
      }
    }

    const factory = new ServiceFactory(browserManager, cookiesMap);
    const aiServices = factory.createServices(services);

    // Show login instructions only if cookies are missing
    const servicesWithoutCookies = services.filter((service) => !cookiesMap.has(service));
    if (servicesWithoutCookies.length > 0) {
      console.log('');
      console.log(chalk.yellow.bold('⚠️  Login Required'));
      console.log(chalk.yellow('Browser windows will open for the following services:'));
      servicesWithoutCookies.forEach((service) => {
        console.log(chalk.yellow(`  • ${service.charAt(0).toUpperCase() + service.slice(1)}`));
      });
      console.log('');
      console.log(chalk.cyan('📝 Instructions:'));
      console.log(chalk.cyan('  1. Log in to each service in the browser windows'));
      console.log(chalk.cyan('  2. If you see "This browser may not be secure" errors:'));
      console.log(chalk.cyan('     - Click "Try again" button'));
      console.log(chalk.cyan('     - Or manually navigate to the service URL and log in'));
      console.log(chalk.cyan('  3. The automation will automatically detect when you\'re logged in'));
      console.log(chalk.cyan('  4. You have up to 5 minutes to complete login'));
      console.log('');
      console.log(chalk.gray('💡 Tip: Use "multi-ai config cookies import" to save cookies and skip login next time'));
      console.log('');
    } else {
      console.log('');
      console.log(chalk.green('✓ Using stored cookies for authentication'));
      console.log('');
    }

    // Initialize all services (this will wait for login only if cookies are missing)
    spinner.text = servicesWithoutCookies.length > 0 ? 'Waiting for login...' : 'Initializing services...';
    try {
      await Promise.all(aiServices.map((service) => service.initialize()));
      spinner.succeed('All services initialized and logged in');
    } catch (error) {
      if (error instanceof Error && error.message.includes('log in')) {
        spinner.fail('Login timeout or incomplete');
        console.error(chalk.red(error.message));
        console.log('');
        console.log(chalk.yellow('Please ensure you are logged in to all services and try again.'));
        await browserManager.close();
        process.exit(1);
      }
      throw error;
    }

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
