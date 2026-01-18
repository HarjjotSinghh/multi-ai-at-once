import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { ServiceFactory, AIServiceName } from '@multi-ai/core';

interface ServiceInfo {
  name: AIServiceName;
  displayName: string;
  baseUrl: string;
}

const SERVICE_INFO: ServiceInfo[] = [
  { name: 'chatgpt', displayName: 'ChatGPT', baseUrl: 'https://chatgpt.com/' },
  { name: 'claude', displayName: 'Claude', baseUrl: 'https://claude.ai/' },
  { name: 'gemini', displayName: 'Gemini', baseUrl: 'https://gemini.google.com/' },
  { name: 'perplexity', displayName: 'Perplexity', baseUrl: 'https://www.perplexity.ai/' },
  { name: 'grok', displayName: 'Grok', baseUrl: 'https://grok.com/' },
  { name: 'deepseek', displayName: 'DeepSeek', baseUrl: 'https://chat.deepseek.com/' },
  { name: 'zai', displayName: 'Z.ai', baseUrl: 'https://z.ai/' },
];

/**
 * Handle list command
 */
export async function handleList(): Promise<void> {
  console.log('');
  console.log(chalk.cyan.bold('Available AI Services'));
  console.log('');

  const table = new Table({
    head: [chalk.cyan('Service'), chalk.cyan('Display Name'), chalk.cyan('URL')],
    colWidths: [15, 20, 40],
    style: {
      head: [],
      border: ['gray'],
    },
  });

  for (const service of SERVICE_INFO) {
    table.push([
      chalk.green(service.name),
      service.displayName,
      chalk.gray(service.baseUrl),
    ]);
  }

  console.log(table.toString());
  console.log('');
  console.log(chalk.yellow('Usage: multi-ai prompt "your prompt" -s chatgpt,claude,gemini'));
  console.log('');
}

/**
 * Create the list command
 */
export function createListCommand(): Command {
  return new Command('list')
    .description('List available AI services')
    .action(handleList);
}
