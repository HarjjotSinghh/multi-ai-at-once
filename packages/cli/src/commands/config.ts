import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs/promises';
import inquirer from 'inquirer';
import { ConfigManager, CookieManager, ServiceFactory, AIServiceName } from '@multi-ai/core';

/**
 * Handle config get command
 */
async function handleGet(key: string): Promise<void> {
  const configManager = new ConfigManager();
  await configManager.load();

  const value = configManager.getPath(key);

  if (value === undefined) {
    console.error(chalk.red(`Config key "${key}" not found`));
    process.exit(1);
  }

  console.log(JSON.stringify(value, null, 2));
}

/**
 * Handle config set command
 */
async function handleSet(keyValue: string): Promise<void> {
  const [key, ...valueParts] = keyValue.split('=');
  const value = valueParts.join('=');

  if (!key || value === undefined) {
    console.error(chalk.red('Invalid format. Use: --set <key=value>'));
    console.error(chalk.yellow('Example: --set services=chatgpt,claude'));
    process.exit(1);
  }

  const configManager = new ConfigManager();
  await configManager.load();

  // Try to parse as JSON, fall back to string
  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(value);
  } catch {
    parsedValue = value;
  }

  await configManager.setPath(key, parsedValue);
  console.log(chalk.green(`Set ${key} = ${JSON.stringify(parsedValue)}`));
}

/**
 * Handle config reset command
 */
async function handleReset(): Promise<void> {
  const configManager = new ConfigManager();
  await configManager.reset();
  console.log(chalk.green('Configuration reset to defaults'));
}

/**
 * Handle config list command
 */
async function handleList(): Promise<void> {
  const configManager = new ConfigManager();
  await configManager.load();

  const config = configManager.get();

  console.log(chalk.cyan('Current Configuration:'));
  console.log(JSON.stringify(config, null, 2));
  console.log('');
  console.log(chalk.yellow(`Config file: ${configManager.getConfigPath()}`));
}

/**
 * Handle cookies import command
 */
async function handleCookiesImport(filePath: string, service?: string): Promise<void> {
  const cookieManager = new CookieManager();
  
  // If service not provided, prompt for it
  let targetService: AIServiceName;
  if (service) {
    targetService = service.toLowerCase() as AIServiceName;
    const availableServices = ServiceFactory.getAvailableServices();
    if (!availableServices.includes(targetService)) {
      console.error(chalk.red(`Invalid service: ${targetService}`));
      console.error(chalk.yellow(`Available services: ${availableServices.join(', ')}`));
      process.exit(1);
    }
  } else {
    const availableServices = ServiceFactory.getAvailableServices();
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'service',
        message: 'Select the AI service:',
        choices: availableServices,
      },
    ]);
    targetService = answer.service;
  }

  // Check if file exists
  const resolvedPath = path.resolve(filePath);
  try {
    await fs.access(resolvedPath);
  } catch {
    console.error(chalk.red(`File not found: ${resolvedPath}`));
    process.exit(1);
  }

  console.log(chalk.cyan(`Importing cookies for ${targetService} from ${resolvedPath}...`));

  try {
    // Extract domain hint from service name
    const domainHints: Record<AIServiceName, string> = {
      chatgpt: 'chatgpt.com',
      claude: 'claude.ai',
      gemini: 'gemini.google.com',
      perplexity: 'perplexity.ai',
      grok: 'x.com',
      deepseek: 'deepseek.com',
      zai: 'z.ai',
    };

    await cookieManager.importFromFile(resolvedPath, targetService, domainHints[targetService]);
    console.log(chalk.green(`✓ Successfully imported cookies for ${targetService}`));
    console.log(chalk.gray(`Cookies saved to: ${cookieManager.getCookiesPath()}`));
  } catch (error) {
    console.error(chalk.red(`Failed to import cookies: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

/**
 * Handle cookies list command
 */
async function handleCookiesList(): Promise<void> {
  const cookieManager = new CookieManager();
  const allCookies = await cookieManager.loadAll();
  const availableServices = ServiceFactory.getAvailableServices();

  console.log(chalk.cyan('Stored Cookies:'));
  console.log('');

  let hasCookies = false;
  for (const service of availableServices) {
    const serviceCookies = allCookies[service];
    if (serviceCookies && serviceCookies.cookies.length > 0) {
      hasCookies = true;
      const lastUpdated = serviceCookies.lastUpdated
        ? new Date(serviceCookies.lastUpdated).toLocaleString()
        : 'Unknown';
      console.log(chalk.green(`  ✓ ${service}`));
      console.log(chalk.gray(`    Cookies: ${serviceCookies.cookies.length}`));
      console.log(chalk.gray(`    Last updated: ${lastUpdated}`));
      console.log('');
    }
  }

  if (!hasCookies) {
    console.log(chalk.yellow('  No cookies stored'));
    console.log('');
    console.log(chalk.cyan('To import cookies:'));
    console.log(chalk.gray('  1. Install "Get cookies.txt LOCALLY" browser extension'));
    console.log(chalk.gray('  2. Export cookies from the AI service website'));
    console.log(chalk.gray('  3. Run: multi-ai config cookies import <file> --service <service>'));
    console.log('');
  }

  console.log(chalk.yellow(`Cookies file: ${cookieManager.getCookiesPath()}`));
}

/**
 * Handle cookies delete command
 */
async function handleCookiesDelete(service: string): Promise<void> {
  const cookieManager = new CookieManager();
  const targetService = service.toLowerCase() as AIServiceName;
  const availableServices = ServiceFactory.getAvailableServices();

  if (!availableServices.includes(targetService)) {
    console.error(chalk.red(`Invalid service: ${targetService}`));
    console.error(chalk.yellow(`Available services: ${availableServices.join(', ')}`));
    process.exit(1);
  }

  const hasCookies = await cookieManager.hasCookies(targetService);
  if (!hasCookies) {
    console.log(chalk.yellow(`No cookies found for ${targetService}`));
    return;
  }

  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Delete cookies for ${targetService}?`,
      default: false,
    },
  ]);

  if (answer.confirm) {
    await cookieManager.deleteCookies(targetService);
    console.log(chalk.green(`✓ Deleted cookies for ${targetService}`));
  } else {
    console.log(chalk.gray('Cancelled'));
  }
}

/**
 * Create the config command
 */
export function createConfigCommand(): Command {
  const cmd = new Command('config')
    .description('Manage configuration');

  cmd
    .command('get')
    .description('Get a config value')
    .argument('<key>', 'Config key (e.g., services, browser.headless)')
    .action(handleGet);

  cmd
    .command('set')
    .description('Set a config value')
    .argument('<key=value>', 'Key-value pair (e.g., services=chatgpt,claude)')
    .action(handleSet);

  cmd
    .command('reset')
    .description('Reset configuration to defaults')
    .action(handleReset);

  cmd
    .command('list')
    .description('List all configuration values')
    .action(handleList);

  // Cookies subcommand
  const cookiesCmd = cmd
    .command('cookies')
    .description('Manage authentication cookies');

  cookiesCmd
    .command('import')
    .description('Import cookies from a cookies.txt or JSON file')
    .argument('<file>', 'Path to cookies file (cookies.txt or JSON format)')
    .option('-s, --service <service>', 'AI service name (chatgpt, claude, gemini, etc.)')
    .action(handleCookiesImport);

  cookiesCmd
    .command('list')
    .description('List all stored cookies')
    .action(handleCookiesList);

  cookiesCmd
    .command('delete')
    .description('Delete cookies for a service')
    .argument('<service>', 'AI service name (chatgpt, claude, gemini, etc.)')
    .action(handleCookiesDelete);

  return cmd;
}
