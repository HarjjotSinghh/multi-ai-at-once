import { Command } from 'commander';
import chalk from 'chalk';
import { ConfigManager, ServiceFactory } from '@multi-ai/core';

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

  return cmd;
}
